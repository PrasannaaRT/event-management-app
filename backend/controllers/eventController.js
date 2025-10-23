const Event = require('../models/Event');
const User = require('../models/User'); // Required for organizer check & notification logic
const Notification = require('../models/Notification'); // Required for notification logic

// Define allowed locations once for validation
const tamilNaduLocations = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem',
  'Tirunelveli', 'Vellore', 'Thoothukudi (Tuticorin)', 'Erode', 'Thanjavur',
  'Dindigul', 'Nagercoil', 'Kancheepuram'
];

// --- GET ALL EVENTS (Now with Search and Filter) ---
exports.getAllEvents = async (req, res) => {
  try {
    const { search, category, location } = req.query; // ADDED: 'location' to destructuring
    let query = { status: 'active' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    // ADDED: Location filter logic
    if (location && location !== 'All') { // Check if location parameter is provided and not 'All'
      query.location = location; // Add location to the query
    }

    const events = await Event.find(query)
      .populate('organizer', 'name organizationName');
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching all events:", err); // Improved error logging
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- GET FEATURED EVENTS ---
exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' }) // Only active events
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('organizer', 'name organizationName');
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching featured events:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- GET EVENTS USER IS ATTENDING ---
exports.getAttendingEvents = async (req, res) => {
  try {
    // Assuming req.user.id is available from auth middleware
    const events = await Event.find({ attendees: req.user.id }) // Find events where user is an attendee
      .populate('organizer', 'name organizationName'); // Show organizer info
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching attending events:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- CREATE A NEW EVENT ---
exports.createEvent = async (req, res) => {
  try {
    // 1. Authorization checks
    const organizer = await User.findById(req.user.id);
    if (!organizer || organizer.role !== 'organizer') {
        return res.status(403).json({ message: 'Forbidden: Only organizers can create events.' });
    }
    if (organizer.verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Forbidden: Your organizer account is not verified yet.' });
    }

    // 2. Extract data, including location
    const { title, description, date, location, isFree, price, imageUrl, galleryImageUrls, category } = req.body;

    // 3. Validate location
    if (!location || !tamilNaduLocations.includes(location)) {
      return res.status(400).json({
        message: `Invalid or missing event location. Please choose from: ${tamilNaduLocations.join(', ')}`
      });
    }

    // 4. Create new event instance
    const newEvent = new Event({
      title,
      description,
      date,
      location, // Save the validated location
      isFree,
      price: isFree ? 0 : price,
      imageUrl,
      galleryImageUrls: galleryImageUrls || [], // Ensure it defaults to an empty array
      category,
      organizer: req.user.id,
      status: 'active', // Default status
    });

    // 5. Save the event
    const event = await newEvent.save();

    // 6. --- NOTIFICATION LOGIC ---
    const usersInLocation = await User.find({ role: 'user', location: event.location });
    const notificationPromises = usersInLocation.map(user => {
      return Notification.create({
        userId: user._id,
        eventId: event._id,
        message: `New event "${event.title}" has been created in your area: ${event.location}!`,
        // createdAt will be set by default by Mongoose timestamps
      });
    });
    await Promise.all(notificationPromises);
    console.log(`Generated ${notificationPromises.length} notifications for new event: "${event.title}" in ${event.location}`);
    // --- END NOTIFICATION LOGIC ---

    // 7. Send success response
    res.status(201).json(event);

  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: 'Server error creating event.', error: err.message });
  }
};

// --- GET A SINGLE EVENT BY ID ---
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
       .populate('organizer', 'name organizationName website bio') // Populate more organizer details if needed
       .populate('attendees', 'name email'); // Populate attendees if needed on detail page

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Optional: Increment views if you add a views field to the schema
    // event.views = (event.views || 0) + 1;
    // await event.save();
    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event by ID:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- GET EVENTS CREATED BY THE LOGGED-IN ORGANIZER ---
exports.getMyEvents = async (req, res) => {
  try {
    // Assuming req.user.id is available from auth middleware
    const events = await Event.find({ organizer: req.user.id }) // Find events matching organizer ID
       .sort({ date: -1 }); // Sort by event date, most recent first
    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching organizer's events:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- REGISTER FOR A FREE EVENT ---
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.status !== 'active') {
       return res.status(400).json({ message: 'This event is not active.' });
    }
    // Ensure only users can register
    if (req.user.role !== 'user') {
       return res.status(403).json({ message: 'Only attendees can register for events.' });
    }
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    event.attendees.push(req.user.id);
    await event.save();
    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (err) {
    console.error("Error registering for event:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- UPDATE AN EVENT ---
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Authorization: Ensure logged-in user is the event organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this event' });
    }

    // Extract potential updates from request body
    const { title, description, date, location, isFree, price, imageUrl, galleryImageUrls, category, status } = req.body;

    // Validate location if it is being updated
    if (location && !tamilNaduLocations.includes(location)) {
      return res.status(400).json({
        message: `Invalid event location. Please choose from: ${tamilNaduLocations.join(', ')}`
      });
    }

    // Apply updates using $set for efficiency
    const updates = { ...req.body };
    if (updates.isFree) {
        updates.price = 0; // Ensure price is 0 if marked free
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    res.status(200).json(updatedEvent);

  } catch (err) {
    console.error("Error updating event:", err);
    // Handle validation errors specifically if needed
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error updating event.', error: err.message });
  }
};

// --- CANCEL AN EVENT (Soft Delete) ---
exports.cancelEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'A reason for cancellation is required.' });
    }
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    // Authorization: Ensure logged-in user is the event organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to cancel this event' });
    }
    if (event.status === 'cancelled') {
        return res.status(400).json({ message: 'Event is already cancelled.' });
    }

    event.status = 'cancelled';
    event.cancellationReason = reason;
    await event.save();
    res.status(200).json({ message: 'Event has been cancelled successfully', event });
  } catch (err) {
    console.error("Error cancelling event:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// You might also need an unregisterFromEvent function if users can cancel their registration.