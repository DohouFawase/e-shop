<?php

namespace App\Http\Controllers\Api\V1\Notification;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $notifications = $request->user()->notifications()->paginate(20);

            return response()->json($notifications);
        } catch (Throwable $e) {
            Log::error('Erreur récupération notifications', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function unreadCount(Request $request)
    {
        try {
            return response()->json([
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ]);
        } catch (Throwable $e) {
            Log::error('Erreur comptage notifications non lues', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function markAsRead(Request $request, string $id)
    {
        try {
            $notification = $request->user()->notifications()->findOrFail($id);
            $notification->markAsRead();

            return response()->json(['message' => 'Notification marquée comme lue.']);
        } catch (Throwable $e) {
            Log::error('Erreur marquage notification', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $request->user()->unreadNotifications->markAsRead();

            return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
        } catch (Throwable $e) {
            Log::error('Erreur marquage notifications', ['error' => $e->getMessage()]);

            return response()->json(['message' => 'Une erreur est survenue.'], 500);
        }
    }
}