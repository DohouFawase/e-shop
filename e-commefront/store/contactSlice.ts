import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiErrorMessage } from "@/lib/api-error";
import { contactSchema, type ContactMessageInput } from "@/schema/contact/ContactSchema";
import { contactService } from "@/services/contact/contactService";

export const sendContactMessage = createAsyncThunk<
  string,
  ContactMessageInput,
  { rejectValue: string }
>("contact/send", async (values, { rejectWithValue }) => {
  try {
    const input = contactSchema.parse(values);
    return (await contactService.send(input)).message;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Impossible d’envoyer votre message."));
  }
});

interface ContactState {
  status: "idle" | "loading" | "succeeded" | "failed";
  message: string | null;
  error: string | null;
}

const initialState: ContactState = { status: "idle", message: null, error: null };

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    clearContactFeedback(state) {
      state.status = "idle";
      state.message = null;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(sendContactMessage.pending, (state) => {
        state.status = "loading";
        state.message = null;
        state.error = null;
      })
      .addCase(sendContactMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload;
      })
      .addCase(sendContactMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Impossible d’envoyer votre message.";
      });
  },
});

export const { clearContactFeedback } = contactSlice.actions;
export default contactSlice.reducer;
