<?php

namespace App\Http\Controllers\Api\V1\Contact;

use App\Http\Controllers\Controller;
use App\Models\Contact\ContactMessage;
use App\Models\Contact\ContactMessageReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'privacy_notice_acknowledged' => ['required', 'accepted'],
        ]);

        unset($data['privacy_notice_acknowledged']);
        $data['privacy_notice_acknowledged_at'] = now();
        $data['privacy_version'] = config('legal.privacy_version');
        $contactMessage = ContactMessage::create($data);

        // The database inbox is the source of truth; mail is a notification channel only.
        $recipient = config('contact.email');
        $notificationSent = false;
        if (is_string($recipient) && filter_var($recipient, FILTER_VALIDATE_EMAIL) !== false) {
            try {
                Mail::raw("Nouveau message reçu depuis le formulaire Naya.\n\n"
                    . "Nom : {$contactMessage->name}\n"
                    . "E-mail : {$contactMessage->email}\n\n"
                    . "Message :\n{$contactMessage->message}\n", function ($mail) use ($recipient, $contactMessage): void {
                        $mail->to($recipient)
                            ->replyTo($contactMessage->email, $contactMessage->name)
                            ->subject('Contact Naya : ' . $contactMessage->subject);
                    });
                $notificationSent = true;
            } catch (Throwable $exception) {
                Log::error('Échec de la notification mail du formulaire contact', [
                    'contact_message_id' => $contactMessage->id,
                    'exception' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Votre message a bien été enregistré. Nous vous répondrons dès que possible.',
            'notification_email_sent' => $notificationSent,
        ], 201);
    }


    public function index(Request $request): JsonResponse
    {
        $messages = ContactMessage::with(['replies.admin:id,first_name,last_name,email'])
            ->orderByRaw('read_at IS NULL DESC')
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json([
            'messages' => $messages,
            'unread_count' => ContactMessage::whereNull('read_at')->count(),
        ]);
    }

    public function markRead(ContactMessage $contactMessage): JsonResponse
    {
        if ($contactMessage->read_at === null) {
            $contactMessage->forceFill(['read_at' => now()])->save();
        }

        return response()->json(['message' => 'Message marqué comme lu.']);
    }

    public function reply(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
        ]);
        $supportAddress = config('contact.email');
        if (!is_string($supportAddress) || filter_var($supportAddress, FILTER_VALIDATE_EMAIL) === false) {
            return response()->json(['message' => 'Configurez CONTACT_EMAIL dans le serveur avant de répondre.'], 503);
        }
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            return response()->json(['message' => 'Configurez un transport SMTP pour envoyer des réponses par e-mail.'], 503);
        }

        $reply = ContactMessageReply::create([
            'contact_message_id' => $contactMessage->id,
            'admin_id' => $request->user()->id,
            'body' => trim($data['body']),
            'status' => 'sending',
        ]);

        try {
            Mail::raw($reply->body, function ($mail) use ($contactMessage, $supportAddress): void {
                $mail->to($contactMessage->email)
                    ->replyTo($supportAddress, config('mail.from.name'))
                    ->subject('Re: ' . $contactMessage->subject);
            });
            $reply->forceFill(['status' => 'sent', 'sent_at' => now()])->save();
        } catch (Throwable $exception) {
            $reply->forceFill(['status' => 'failed'])->save();
            Log::error('Échec de la réponse au message contact', [
                'contact_message_id' => $contactMessage->id,
                'reply_id' => $reply->id,
                'exception' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'La réponse n’a pas pu être envoyée. Vérifiez la configuration e-mail et réessayez.'], 503);
        }

        return response()->json([
            'message' => 'Votre réponse a été envoyée.',
            'reply' => $reply->load('admin:id,first_name,last_name,email'),
        ], 201);
    }
}
