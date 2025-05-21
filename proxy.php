<?php
/**
 * Dog API Proxy
 * 
 * This script acts as a proxy for the Dog API to solve CORS issues.
 * It fetches a random dog image from the Dog API and returns it to the client.
 */

// Set headers to allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Fetch a random dog image from the Dog API
$apiUrl = 'https://dog.ceo/api/breeds/image/random';
$response = file_get_contents($apiUrl);

if ($response === false) {
    // Return error response if the request fails
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch data from Dog API']);
} else {
    // Return the Dog API response
    echo $response;
}
