import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { Box, Card, CardContent, Typography, Button, Stack, Divider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

function SlotCard({ slot, onBook }) {
  const statusText = slot.isFull
    ? `Full • Booked by: ${slot.bookedTeams.join(", ")}`
    : slot.bookingsCount > 0
      ? `Partial • Remaining: ${slot.remaining} • Booked by: ${slot.bookedTeams.join(", ")}`
      : `Available • Remaining: ${slot.remaining}`;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h6">
              {slot.startTime} - {slot.endTime}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Ground: {slot.groundId?.name || "Ground"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {statusText}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
              Capacity: {slot.bookingsCount}/{slot.capacity}
            </Typography>
          </Box>

          <Button
            variant="contained"
            disabled={slot.isFull}
            onClick={() => onBook(slot)}
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            {slot.isFull ? "Full" : "Book Now"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function SlotCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiDate = useMemo(() => selectedDate.format("YYYY-MM-DD"), [selectedDate]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/slots?date=${apiDate}`);
      setSlots(res.data?.data || []);
    } catch (e) {
      console.error(e);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line
  }, [apiDate]);

  const handleBook = async (slot) => {
    // ⚠️ Here you can open modal for team select
    // For now simple prompt
    const teamId = window.prompt("Enter teamId to book this slot:");
    if (!teamId) return;

    try {
      await axios.post(`/api/bookings/${slot._id}/book`, { teamId });
      alert("Booked Successfully!");
      fetchSlots(); // refresh
    } catch (e) {
      alert(e?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Slot Booking Calendar
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
        <Card variant="outlined" sx={{ borderRadius: 2, minWidth: 320 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Select Date
            </Typography>
            <Divider sx={{ mb: 1 }} />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar value={selectedDate} onChange={setSelectedDate} />
            </LocalizationProvider>

            <Typography variant="body2" sx={{ mt: 1, opacity: 0.75 }}>
              Selected: {apiDate}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Slots on {apiDate}
          </Typography>

          {loading ? (
            <Typography>Loading slots...</Typography>
          ) : slots.length === 0 ? (
            <Typography>No slots available for this date.</Typography>
          ) : (
            <Stack spacing={2}>
              {slots.map((slot) => (
                <SlotCard key={slot._id} slot={slot} onBook={handleBook} />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
