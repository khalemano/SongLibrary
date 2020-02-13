// Defines the songLibraryApp module
var libApp = angular.module('songLibraryApp', []);

// Defines the SongListController
libApp.controller('SongListController', ['$scope', '$http', function SongListController($scope, $http){
	var serverUrl = "https://www.khalemano.com/songlist";
	$scope.songs = {}; // Stores the model internal state, indexed by song id.
	$scope.pending = {}; // Bound to the song add and update modal.
	$scope.pendingAdd = {}; // Stores uncommitted information from the song add modal.
	
	$scope.propertyName = "title"; // Determines which song property to sort on.
	$scope.reverse = false; // Determines whether sort should be ascending or descending.
	
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
	
	$http.get(serverUrl).then(function(response){
		$scope.songs = processResponseData(response.data);
	},function(response){
		console.log(response);
	});
	
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
	
	$scope.saveSongList = function(){
		var songJson = getSongListAsJson();
		var headers = {'Content-Type':'text/plain'}
		$scope.saveInProgress = true;
		
		$http.post(serverUrl, songJson, {headers:headers}).then(function successCallback(response){
			$scope.saveInProgress = false;
			$scope.saveStatus = "SUCCESS";
			$scope.saveStatusMsg = "SAVED SUCCESSFULLY";
		}, function errorCallback(response){
			$scope.saveInProgress = false;
			$scope.saveStatus = "ERROR";
			$scope.saveStatusMsg = "ERROR OCCURRED WHILE SAVING.  PLEASE TRY AGAIN.";
		});
	}
	
	$scope.clearSaveStatusMsg = function(){
		$scope.saveStatusMsg = undefined;
	}
	
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
	
	// Used by angular to filter the song library
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
	
	$scope.clearReleaseDateFilter = function(){
		$scope.appliedReleaseDateRangeStart = undefined;
		$scope.appliedReleaseDateRangeEnd = undefined;		
	}
	
	$scope.hasReleaseDateFilter = function(){
		return ($scope.appliedReleaseDateRangeStart || $scope.appliedReleaseDateRangeEnd) ? true : false;
	}
	
	$scope.noFiltersApplied = function(){
		return !$scope.hasReleaseDateFilter();
	}
	
	// Returns the song library as an array
	$scope.getSongArray = function(){
		return Object.values($scope.songs);
	}
	
	$scope.sortBy = function(propertyName){
		$scope.reverse = $scope.propertyName === propertyName ? !$scope.reverse : false;
		$scope.propertyName = propertyName;
	}
	
	$scope.prepModelForDelete = function(song){
		$scope.songForDelete = song;
	}
	
	// Deletes a song from the library
	$scope.deleteSong = function(id){
		delete $scope.songs[id];
	};
	
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
	
	$scope.prepModalForUpdate = function(songDetails){
		$scope.pending =  angular.copy(songDetails);
		$scope.songEditModalMode = "UPDATE";
		$scope.songEditModalTitle = "Update Song";
		$scope.songEditTitleValid = true;
	}
	
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
	
	// Generates UUIDs
	function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.floor(Math.random() * 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	  });
	}
	
	//Formats a date string to yyyy-mm-dd format
	function formatDateString(date){
		return date.toISOString().split('T')[0];
	}
	
	//Populates a Date instance from a string in yyyy-mm-dd format
	function parseDate(dateString){
		var dateParts = dateString.split("-").map(x=>parseInt(x));
		var date = new Date();
		date.setFullYear(dateParts[0], dateParts[1]-1, dateParts[2]);
		date.setHours(0,0,0,0);
		return date;
	}
}]);
