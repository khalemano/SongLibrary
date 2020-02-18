// Defines the songLibraryApp module
var libApp = angular.module('songLibraryApp', []);

// Defines the SongListController
libApp.controller('SongListController', ['$scope', '$http', function SongListController($scope, $http){
	var serverUrl = "https://www.khalemano.com/songlist";
	
	$scope.initialLoadErrorMsg = ""; // Error message shown if initial data load fails.
	
	$scope.songs = {}; // Stores the model internal state, indexed by song id.
	$scope.pending = {}; // Bound to the song add and update modal.
	$scope.pendingAdd = {}; // Stores uncommitted information from the song add modal.
	
	// Stores the options for sorting songs
	$scope.sortOptions=[
		{"display":"Title (A-Z)", "property": "title", "reverse": false},
		{"display":"Title (Z-A)", "property": "title", "reverse": true},
		{"display":"Artist (A-Z)", "property": "artist", "reverse": false},
		{"display":"Artist (Z-A)", "property": "artist", "reverse": true},
		{"display":"Release Date (Oldest-Newest)", "property": "releaseDateObj", "reverse": false},
		{"display":"Release Date (Newest-Oldest)", "property": "releaseDateObj", "reverse": true},
		{"display":"Price (Lowest-Highest)", "property": "price", "reverse": false},
		{"display":"Price (Highest-Lowest)", "property": "price", "reverse": true},
	];
	$scope.selectedSortOption = $scope.sortOptions[0]; // Bound to the current selected sort option
		
	$scope.releaseDateRangeStart; // Bound to release date filter input.
	$scope.releaseDateRangeEnd; // Bound to release date filter input.
	$scope.releaseDateRangeValid = true; // Indicates whether release date filter is valid.
	$scope.appliedReleaseDateRangeStart; // Determines the value of the applied release date filter.
	$scope.appliedReleaseDateRangeEnd; // Determines the value of the applied release date filter.
	
	$scope.songEditTitleValid = true; // Indicates whether the song title in the edit modal is valid.
	$scope.songEditModalMode = ""; // Indicates whether edit modal is in "ADD" or "UPDATE" mode.
	$scope.songEditModalTitle = ""; // Bound to the edit modal title.
	
	$scope.songForDelete; // Song id that will be deleted.
	
	$scope.saveInProgress = false; // True between the time the save async call is made and when the response arrives.
	$scope.saveStatus = "SUCCESS"; // "SUCCESS" or "ERROR" based on the save async call.
	$scope.saveStatusMsg = undefined; // Message given to user after save async call returns.
	
	$http.get(serverUrl).then(function successCallback(response){
		$scope.songs = processResponseData(response.data);
	},function errorCallback(response){
		$scope.initialLoadErrorMsg = "Error occurred while loading song data.  Please try reloading.";
	});
	
	// Processes song data from server.
	// Indexes the song by id and converts date strings into date objects.
	function processResponseData(songList){
		var model = {};
		songList.forEach(function(e){
			var songDetails = angular.copy(e);
			var id = songDetails['id'];
			if (songDetails['releaseDate']){
				songDetails['releaseDateObj'] = parseDate(songDetails['releaseDate']);
			}
			model[id] = songDetails;
		});
		return model;
	}
	
	// Sends songs to server.
	$scope.saveSongList = function(){
		var songJson = getSongListAsJson();
		var headers = {'Content-Type':'text/plain'}
		$scope.saveInProgress = true;
		
		$http.post(serverUrl, songJson, {headers:headers}).then(function successCallback(response){
			$scope.saveInProgress = false;
			$scope.saveStatus = "SUCCESS";
			$scope.saveStatusMsg = "SAVED SUCCESSFULLY.";
		}, function errorCallback(response){
			$scope.saveInProgress = false;
			$scope.saveStatus = "ERROR";
			$scope.saveStatusMsg = "ERROR OCCURRED WHILE SAVING.  PLEASE TRY AGAIN.";
		});
	}
	
	// Removes the save status message.
	$scope.clearSaveStatusMsg = function(){
		$scope.saveStatusMsg = undefined;
	}
	
	// Puts song data into JSON format prior to save.
	// Converts data objects into date strings.
	function getSongListAsJson(){
		var songList = Object.values($scope.songs).map(function(e){
			var songDetails = {};
			songDetails['id'] = e['id'];
			songDetails['title'] = e['title'];
			songDetails['artist'] = e['artist'];
			songDetails['releaseDate'] = formatDateString(e['releaseDateObj']);
			songDetails['price'] = e['price'];
			return songDetails;
		})
		
		return JSON.stringify(songList);
	}

	// Attempts to apply the release date filter.
	// Will abort if proposed filter is invalid.
	$scope.applyReleaseDateRange = function(){
		$scope.releaseDateRangeValid = validateReleaseDateRange();
		if ($scope.releaseDateRangeValid){
			$scope.appliedReleaseDateRangeStart = $scope.releaseDateRangeStart;
			$scope.appliedReleaseDateRangeEnd = $scope.releaseDateRangeEnd;			
		}
	}

	function validateReleaseDateRange(){
		if (!$scope.releaseDateRangeStart || !$scope.releaseDateRangeEnd){
			return true;
		} else if ($scope.releaseDateRangeStart.valueOf() > $scope.releaseDateRangeEnd.valueOf()){
			return false;
		} else {
			return true;
		}
	}
	
	// Used by angular to filter the song library.
	$scope.releaseDateFilter = function(value){
		var date = value['releaseDateObj'];
		var start = $scope.appliedReleaseDateRangeStart;
		var end = $scope.appliedReleaseDateRangeEnd;
		
		if(!start && !end){
			return true;
		} else if (!date){
			return false;
		} else if (start && start.valueOf() > date.valueOf()){
			return false;
		} else if (end && end.valueOf() < date.valueOf()){
			return false;
		} else {
			return true;
		}
	}
	
	// Removes the release date filter.
	$scope.clearReleaseDateFilter = function(){
		$scope.appliedReleaseDateRangeStart = undefined;
		$scope.appliedReleaseDateRangeEnd = undefined;		
	}
	
	// Checks whether the release date filter is applied.
	$scope.hasReleaseDateFilter = function(){
		return ($scope.appliedReleaseDateRangeStart || $scope.appliedReleaseDateRangeEnd) ? true : false;
	}
	
	// Checks that no filers are applied.
	// Add to this method as more filters are created.
	$scope.noFiltersApplied = function(){
		return !$scope.hasReleaseDateFilter();
	}
	
	// Returns the song library as an array.
	$scope.getSongArray = function(){
		return Object.values($scope.songs);
	}
		
	// Sets song for the delete confirmation modal.
	$scope.prepModelForDelete = function(song){
		$scope.songForDelete = song;
	}
	
	// Deletes a song from the library.
	$scope.deleteSong = function(id){
		delete $scope.songs[id];
	};
	
	// Sets song for the add song modal.
	$scope.prepModalForAdd = function(){
		$scope.pending = $scope.pendingAdd;
		$scope.songEditModalMode = "ADD";
		$scope.songEditModalTitle = "Add Song";
		$scope.songEditTitleValid = true;
	}
	
	function checkSongTitleValidity(){
		if($scope.pending['title']){ 
			return true;
		} else {
			return false;
		}
	}
	
	// Saves song to song list if it is valid.
	$scope.commitAdd = function(){
		$scope.songEditTitleValid = checkSongTitleValidity();
		if ($scope.songEditTitleValid){
			var id = getNewId();
		
			var songDetails = angular.copy($scope.pendingAdd);
			songDetails['id'] = id;
			$scope.songs[id] = 	songDetails;
		
			$scope.pendingAdd = {};
		}
	}
	
	// Sets song for the update modal.
	$scope.prepModalForUpdate = function(songDetails){
		$scope.pending =  angular.copy(songDetails);
		$scope.songEditModalMode = "UPDATE";
		$scope.songEditModalTitle = "Update Song";
		$scope.songEditTitleValid = true;
	}
	
	// Updates song in song list if it is valid.
	$scope.commitUpdate = function commitUpdate(){
		$scope.songEditTitleValid = checkSongTitleValidity();
		if ($scope.songEditTitleValid){
			if($scope.pending['id']){
				var id = $scope.pending['id'];
				$scope.songs[id] = angular.copy($scope.pending);
			} else {
				throw new Error('Failed to update record due to missing ID');
			}
		}
	}
	
	// Attempts to find a unique id three times or throws an error.
	function getNewId(){
		var maxAttempts = 3;
		for (var attempt = 0; attempt<maxAttempts; attempt++){
			var id = uuidv4();
			if (!$scope.songs[id]){
				return id;
			} else {
				throw new Error('Failed to generate new song GUID');
			}
		}	
	}
	
	// Generates UUIDs.
	function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.floor(Math.random() * 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	  });
	}
	
	//Formats a date string to yyyy-mm-dd format.
	function formatDateString(date){
		return date.toISOString().split('T')[0];
	}
	
	//Populates a Date instance from a string in yyyy-mm-dd format.
	function parseDate(dateString){
		var dateParts = dateString.split("-").map(x=>parseInt(x));
		var date = new Date();
		date.setFullYear(dateParts[0], dateParts[1]-1, dateParts[2]);
		date.setHours(0,0,0,0);
		return date;
	}
}]);
