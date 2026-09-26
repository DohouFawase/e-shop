import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiErrorMessage } from "@/lib/api-error";
import { contactInboxService, type ContactInboxMessage, type ContactMessageReply } from "@/services/contact/contactInboxService";

export const fetchContactInbox = createAsyncThunk(
  "contactInbox/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await contactInboxService.list();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Impossible de charger les messages."));
    }
  },
);

export const markContactMessageRead = createAsyncThunk(
  "contactInbox/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      await contactInboxService.markRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Impossible de mettre le message à jour."));
    }
  },
);

export const sendContactReply = createAsyncThunk<
  { messageId: string; reply: ContactMessageReply },
  { messageId: string; body: string },
  { rejectValue: string }
>("contactInbox/reply", async ({ messageId, body }, { rejectWithValue }) => {
  try {
    const reply = await contactInboxService.reply(messageId, body);
    return { messageId, reply };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Impossible d’envoyer la réponse."));
  }
});

interface ContactInboxState {
  messages: ContactInboxMessage[];
  unreadCount: number;
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ContactInboxState = { messages: [], unreadCount: 0, total: 0, status: "idle", error: null };

const contactInboxSlice = createSlice({
  name: "contactInbox",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchContactInbox.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchContactInbox.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messages = action.payload.messages.data;
        state.total = action.payload.messages.total;
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(fetchContactInbox.rejected, (state, action) => {
        state.status = "failed";
        state.error = typeof action.payload === "string" ? action.payload : action.error.message ?? "Impossible de charger les messages.";
      })
      .addCase(markContactMessageRead.fulfilled, (state, action) => {
        const message = state.messages.find((item) => item.id === action.payload);
        if (message && !message.read_at) {
          message.read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(sendContactReply.fulfilled, (state, action) => {
        const message = state.messages.find((item) => item.id === action.payload.messageId);
        if (message) message.replies.push(action.payload.reply);
      });
  },
});

export default contactInboxSlice.reducer;
