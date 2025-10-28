// Test script to verify GraphQL API authorization
const { Amplify } = require('aws-amplify');
const { generateClient } = require('aws-amplify/data');
const outputs = require('./amplify_outputs.json');

// Configure Amplify
Amplify.configure(outputs);

const client = generateClient();

async function testEventUpdate() {
  try {
    console.log('Testing event update...');
    
    // Test data from your curl request
    const eventId = 'b51660f5-6e5f-47ad-82a3-7463034bc2a9';
    const updateData = {
      id: eventId,
      title: 'Hello Updated',
      description: 'Updated description',
      date: '2025-10-22T03:50',
      location: 'ahmedabad',
      totalTickets: 120,
      price: 20,
      category: 'Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2064'
    };

    const result = await client.models.Event.update(updateData);
    console.log('Update successful:', result);
    
  } catch (error) {
    console.error('Update failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

async function testEventList() {
  try {
    console.log('Testing event list...');
    const result = await client.models.Event.list();
    console.log('List successful, found', result.data?.length, 'events');
  } catch (error) {
    console.error('List failed:', error);
  }
}

async function runTests() {
  console.log('Starting API tests...');
  await testEventList();
  await testEventUpdate();
}

runTests();
