<?php

namespace App\Http\Controllers\Api\V1\Notification;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function publicKey()
    {
        $key = config('webpush.vapid.public_key');

        if (! is_string($key) || $key === '') {
            return response()->json(['message' => 'Les notifications push ne sont pas configurées sur le serveur.'], 503);
        }

        return response()->json(['public_key' => $key]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'endpoint' => ['required', 'url', 'max:1024'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->updatePushSubscription(
            $data['endpoint'],
            $data['keys']['p256dh'],
            $data['keys']['auth'],
        );

        return response()->json(['message' => 'Notifications système activées.']);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'endpoint' => ['required', 'url', 'max:1024'],
        ]);

        $request->user()->deletePushSubscription($data['endpoint']);

        return response()->json(['message' => 'Notifications système désactivées.']);
    }
}
