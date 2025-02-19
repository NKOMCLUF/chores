<?php
$csvFile = 'records.csv';

function deleteRecord($csvFile, $timestamp, $room, $value) {
    $records = array_map('str_getcsv', file($csvFile));
    $newRecords = [];
    $found = false;

    foreach ($records as $record) {
        $csvTimestamp = new DateTime($record[0]);
        $requestTimestamp = new DateTime($timestamp);
        echo "Checking record: " . implode(',', $record) . "<br>"; // Debug statement
        echo "Comparing with: " . $requestTimestamp->format(DateTime::ISO8601) . ", $room, $value<br>"; // Debug statement

        if ($csvTimestamp == $requestTimestamp && $record[1] == $room && $record[2] == $value) {
            $found = true;
        } else {
            $newRecords[] = $record;
        }
    }

    if ($found) {
        $fp = fopen($csvFile, 'w');
        foreach ($newRecords as $record) {
            fputcsv($fp, $record);
        }
        fclose($fp);
        return "Record deleted successfully";
    } else {
        return "Error: Record not found";
    }
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $room = isset($_POST['room']) ? $_POST['room'] : '';
    $value = isset($_POST['value']) ? floatval($_POST['value']) : 0;
    $timestamp = isset($_POST['timestamp']) ? $_POST['timestamp'] : '';

    echo "Received POST data:<br>";
    echo "action: $action<br>";
    echo "room: $room<br>";
    echo "value: $value<br>";
    echo "timestamp: $timestamp<br>";

    if (!empty($room) && $value > 0 && !empty($timestamp)) {
        if ($action === 'add') {
            // Append to CSV file
            $data = array($timestamp, $room, $value);
            $fp = fopen($csvFile, 'a');
            fputcsv($fp, $data);
            fclose($fp);
            echo "Record added successfully";
        } elseif ($action === 'delete') {
            echo deleteRecord($csvFile, $timestamp, $room, $value);
        } else {
            echo "Error: Invalid action";
        }
    } else {
        echo "Error: Invalid data provided";
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    // Handle DELETE request
    parse_str(file_get_contents("php://input"), $_DELETE);
    $timestamp = isset($_DELETE['timestamp']) ? $_DELETE['timestamp'] : '';
    $room = isset($_DELETE['room']) ? $_DELETE['room'] : '';
    $value = isset($_DELETE['value']) ? floatval($_DELETE['value']) : 0;

    echo "Received DELETE data:<br>";
    echo "timestamp: $timestamp<br>";
    echo "room: $room<br>";
    echo "value: $value<br>";

    if (!empty($room) && $value > 0 && !empty($timestamp)) {
        echo deleteRecord($csvFile, $timestamp, $room, $value);
    } else {
        echo "Error: Invalid data provided";
    }
} else {
    echo "Error: Invalid request method";
}
?>
