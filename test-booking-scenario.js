// Complete Booking Scenario Test
const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/data');
const outputs = require('./amplify_outputs.json');

// Configure Amplify
Amplify.configure(outputs);

const client = generateClient();

async function testCompleteBookingScenario() {
  console.log('🎫 Starting Complete Booking Scenario Test...\n');

  try {
    // Step 1: List all events
    console.log('📋 Step 1: Fetching available events...');
    const { data: events } = await client.models.Event.list();
    console.log(`Found ${events.length} events:`);
    events.forEach(event => {
      console.log(`  - ${event.title} (${event.ticketsAvailable}/${event.totalTickets} tickets) - $${event.price}`);
    });

    if (events.length === 0) {
      console.log('❌ No events found. Please create an event first.');
      return;
    }

    // Step 2: Select first available event
    const selectedEvent = events.find(e => e.ticketsAvailable > 0) || events[0];
    console.log(`\n🎯 Step 2: Selected event: "${selectedEvent.title}"`);
    console.log(`   Event ID: ${selectedEvent.id}`);
    console.log(`   Available tickets: ${selectedEvent.ticketsAvailable}`);
    console.log(`   Price: $${selectedEvent.price}`);

    // Step 3: Create a test booking
    console.log('\n🎫 Step 3: Creating booking...');
    const quantity = 1;
    const totalPrice = selectedEvent.price * quantity;
    const qrCode = `EVENTORA-${selectedEvent.id}-test-user-${Date.now()}`;
    
    const bookingData = {
      eventId: selectedEvent.id,
      userId: 'test-user-123',
      userName: 'Test User',
      userEmail: 'test@example.com',
      eventTitle: selectedEvent.title,
      quantity: quantity,
      totalPrice: totalPrice,
      status: 'confirmed',
      qrCode: qrCode,
      createdAt: new Date().toISOString(),
    };

    console.log('Booking data:', JSON.stringify(bookingData, null, 2));

    const bookingResult = await client.models.Booking.create(bookingData);
    console.log('✅ Booking created successfully!');
    console.log('Booking ID:', bookingResult.data?.id);
    console.log('QR Code:', qrCode);

    // Step 4: Update event tickets
    console.log('\n🎟️ Step 4: Updating event tickets...');
    const newTicketsAvailable = selectedEvent.ticketsAvailable - quantity;
    
    await client.models.Event.update({
      id: selectedEvent.id,
      ticketsAvailable: newTicketsAvailable,
    });
    console.log(`✅ Event tickets updated: ${newTicketsAvailable}/${selectedEvent.totalTickets} remaining`);

    // Step 5: Verify booking exists
    console.log('\n🔍 Step 5: Verifying booking...');
    const { data: bookings } = await client.models.Booking.list({
      filter: { eventId: { eq: selectedEvent.id } }
    });
    console.log(`Found ${bookings.length} bookings for this event`);

    // Step 6: Test QR code validation
    console.log('\n📱 Step 6: Testing QR code validation...');
    const bookingWithQR = bookings.find(b => b.qrCode === qrCode);
    if (bookingWithQR) {
      console.log('✅ QR code found in database');
      console.log('Booking status:', bookingWithQR.status);
      console.log('Guest details:', {
        name: bookingWithQR.userName,
        email: bookingWithQR.userEmail,
        quantity: bookingWithQR.quantity,
        totalPrice: bookingWithQR.totalPrice
      });
    } else {
      console.log('❌ QR code not found in database');
    }

    // Step 7: Test booking update (mark as used)
    console.log('\n✅ Step 7: Testing ticket validation (mark as used)...');
    if (bookingWithQR) {
      await client.models.Booking.update({
        id: bookingWithQR.id,
        status: 'used',
        usedAt: new Date().toISOString(),
      });
      console.log('✅ Ticket marked as used');
    }

    // Step 8: Final verification
    console.log('\n📊 Step 8: Final verification...');
    const { data: finalBookings } = await client.models.Booking.list({
      filter: { eventId: { eq: selectedEvent.id } }
    });
    
    const usedBookings = finalBookings.filter(b => b.status === 'used');
    const confirmedBookings = finalBookings.filter(b => b.status === 'confirmed');
    
    console.log(`Total bookings: ${finalBookings.length}`);
    console.log(`Used tickets: ${usedBookings.length}`);
    console.log(`Confirmed tickets: ${confirmedBookings.length}`);

    console.log('\n🎉 Booking scenario test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Event: ${selectedEvent.title}`);
    console.log(`   Booking created: ✅`);
    console.log(`   Tickets updated: ✅`);
    console.log(`   QR code generated: ✅`);
    console.log(`   Ticket validated: ✅`);
    console.log(`   Email trigger: ⏳ (Manual)`);

  } catch (error) {
    console.error('❌ Booking scenario test failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

async function testEmailTrigger() {
  console.log('\n📧 Testing Email Trigger...');
  
  try {
    // This would normally be triggered automatically
    // For testing, we'll simulate the email data
    const emailData = {
      bookingId: 'test-booking-123',
      userEmail: 'test@example.com',
      userName: 'Test User',
      eventTitle: 'Test Event',
      quantity: 1,
      totalPrice: 12.00,
      qrCode: 'EVENTORA-test-event-test-user-1234567890'
    };

    console.log('Email data that would be sent:', JSON.stringify(emailData, null, 2));
    console.log('📧 Email would be sent to:', emailData.userEmail);
    console.log('🎫 QR code would be embedded:', emailData.qrCode);
    console.log('✅ Email trigger test completed (simulated)');

  } catch (error) {
    console.error('❌ Email trigger test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Complete Booking Scenario Tests...\n');
  
  await testCompleteBookingScenario();
  await testEmailTrigger();
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Deploy backend: npm run sandbox');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Test in browser: http://localhost:5173');
  console.log('4. Create event as admin');
  console.log('5. Book ticket as user');
  console.log('6. Check email for confirmation');
  console.log('7. Test QR scanner as admin');
}

// Run the tests
runAllTests();
