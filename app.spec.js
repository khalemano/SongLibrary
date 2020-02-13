describe('Test for song library', function() {
	var serverUrl = "https://www.khalemano.com/songlist";

	beforeEach(module('songLibraryApp'));
	
	describe('SongListController with failed initial load', function(){
		var $httpBackend, scope;
		
		beforeEach(inject(function($controller, _$httpBackend_){
			scope = {};
			$httpBackend = _$httpBackend_;
			$httpBackend.expectGET(serverUrl).respond(500, 'failure');
			$controller('SongListController', {$scope:scope});
			$httpBackend.flush();
		}));
		
		it('sets the error message for the user', function(){
			expect(scope.initialLoadErrorMsg).toBe("Error occurred while loading song data.  Please try reloading.");
		});
	});
	
	describe('SongListController', function(){
		var $httpBackend, scope;
		var id = "400ec33b-6eb3-438c-a333-af8e2322c8a3";
		var title = "Mr. Blue Sky";
		var artist = "Electric Light Orchestra";
		var releaseDate = "1978-01-28";
		var price = 5.01;
		var data = [{"id":id,"title":title,"artist":artist,"releaseDate":releaseDate,"price":price}];
		
		beforeEach(inject(function($controller, _$httpBackend_){
			scope = {};
			$httpBackend = _$httpBackend_;
			$httpBackend.expectGET(serverUrl).respond(data);
			$controller('SongListController', {$scope:scope});
			$httpBackend.flush();
		}));
	
		it('populates the song list', function(){
			expect(scope.songs[id]['id']).toBe(id);
			expect(scope.songs[id]['title']).toBe(title);
			expect(scope.songs[id]['artist']).toBe(artist);
			expect(scope.songs[id]['releaseDate']).toBe(releaseDate);
			expect(scope.songs[id]['price']).toBe(price);
		});

		it('sets save status to SUCCESS when save works', function(){
			$httpBackend.expectPOST(serverUrl, data).respond(200,'Saved');
			
			scope.saveSongList();
			$httpBackend.flush();
			
			expect(scope.saveStatus).toBe('SUCCESS');
			expect(scope.saveStatusMsg).toBe('SAVED SUCCESSFULLY');
		});
		
		it('sets save status to ERROR when save fails', function(){
			$httpBackend.expectPOST(serverUrl, data).respond(500,'internal failure');
			
			scope.saveSongList();
			$httpBackend.flush();
			
			expect(scope.saveStatus).toBe('ERROR');
			expect(scope.saveStatusMsg).toBe('ERROR OCCURRED WHILE SAVING.  PLEASE TRY AGAIN.');
		});
		
		it('clears the save status message when asked', function(){
			$httpBackend.expectPOST(serverUrl, data).respond(200,'Saved');
			
			scope.saveSongList();
			$httpBackend.flush();
			scope.clearSaveStatusMsg();
			
			expect(scope.saveStatusMsg).toBeUndefined();
		});
		
		
		describe('Release Date Filter', function(){
		
			beforeEach(function(){
				scope.releaseDateRangeStart = new Date("1970-01-01");
				scope.releaseDateRangeEnd = new Date("1980-01-01");
			});
			
			it('is initially unset', function(){
				expect(scope.hasReleaseDateFilter()).toBeFalse();
				expect(scope.noFiltersApplied()).toBeTrue();
			});
			
			it('is set after calling applyReleaseDateRange', function(){
				scope.applyReleaseDateRange();
				
				expect(scope.hasReleaseDateFilter()).toBeTrue();
				expect(scope.noFiltersApplied()).toBeFalse();
				expect(scope.releaseDateRangeValid).toBeTrue();
			});
			
			it('is unset after calling clearReleaseDateFilter', function(){
				scope.applyReleaseDateRange();
				scope.clearReleaseDateFilter();
				
				expect(scope.hasReleaseDateFilter()).toBeFalse();
				expect(scope.noFiltersApplied()).toBeTrue();
			});
			
			it('keeps dates in or matching the range', function(){
				scope.applyReleaseDateRange();
				var inRange = new Date("1975-01-01");
				var onRange1 = new Date("1970-01-01");
				var onRange2 = new Date("1980-01-01");
				
				expect(scope.hasReleaseDateFilter()).toBeTrue();
				expect(scope.releaseDateFilter({releaseDateObj: inRange})).toBeTrue();
				expect(scope.releaseDateFilter({releaseDateObj: onRange1})).toBeTrue();
				expect(scope.releaseDateFilter({releaseDateObj: onRange2})).toBeTrue();
			});
			
			it('excludes dates outside of range', function(){
				scope.applyReleaseDateRange();
				var outOfRange = new Date("1985-01-01");
				
				expect(scope.hasReleaseDateFilter()).toBeTrue();
				expect(scope.releaseDateFilter({releaseDateObj: outOfRange})).toBeFalse();
			});
			
			it('does not apply filter if range is invalid', function(){
				scope.releaseDateRangeStart = new Date("2000-01-01");
				scope.releaseDateRangeEnd = new Date("1980-01-01");
				
				scope.applyReleaseDateRange();
				
				expect(scope.hasReleaseDateFilter()).toBeFalse();
				expect(scope.noFiltersApplied()).toBeTrue();
				expect(scope.releaseDateRangeValid).toBeFalse();
			});
		
		});
		
		it('sets the sort propertyName', function(){
			scope.sortBy('artist');
			
			expect(scope.propertyName).toBe('artist');
			expect(scope.reverse).toBeFalse();
		});
		
		it('sets the sort direction to reverse if the same property is clicked twice', function(){
			scope.sortBy('artist');
			scope.sortBy('artist');
			
			expect(scope.propertyName).toBe('artist');
			expect(scope.reverse).toBeTrue();
		});
		
		it('sets the songForDelete for the confirmation modal', function(){
			scope.prepModelForDelete(data[0]);
			
			expect(scope.songForDelete).toBe(data[0]);
		});
		
		it('deletes a song from the song library', function(){
			scope.deleteSong(id);
			
			expect(scope.songs).toEqual({});
			expect(scope.getSongArray()).toEqual([]);
		});
		
		describe('Add Song Procedure', function(){
		
			beforeEach(function(){
				scope.prepModalForAdd();
			});
			
			it('prepped the edit modal for adding a song', function(){
				expect(scope.songEditModalMode).toBe("ADD");
				expect(scope.songEditModalTitle).toBe("Add Song");
				expect(scope.songEditTitleValid).toBeTrue();
			});
			
			it('adds a song to the song list', function(){
				// Deleting current song to make it easier to locate the added song.
				scope.deleteSong(id);
				var titleForAdd = 'UNIQUE_SONG_TITLE';
				scope.pending['title'] = titleForAdd;
				
				scope.commitAdd();
				
				expect(scope.songEditTitleValid).toBeTrue();
				expect(scope.getSongArray()[0]['title']).toBe(titleForAdd);
			});
			
			it('does not add song if title is missing', function(){
				// Deleting current song to make it easier to locate the added song.
				scope.deleteSong(id);
				
				scope.commitAdd();
				
				expect(scope.songEditTitleValid).toBeFalse();
				expect(scope.getSongArray().length).toBe(0);
			});
			
			it('modal data gets replaced if modal mode switches to update', function(){
				var titleForAdd = 'UNIQUE_SONG_TITLE';
				scope.pending['title'] = titleForAdd;
				
				scope.prepModalForUpdate(scope.songs[id]);
				
				expect(scope.pending).toEqual(scope.songs[id]);
			});
			
			it('restores add data after modal mode switches to update and back to add', function(){
				var titleForAdd = 'UNIQUE_SONG_TITLE';
				scope.pending['title'] = titleForAdd;
				
				scope.prepModalForUpdate(scope.songs[id]);
				scope.prepModalForAdd();
				
				expect(scope.pending['title']).toBe(titleForAdd);
			});
			
		});
		
		describe('Update Song Procedure', function(){
		
			beforeEach(function(){
				scope.prepModalForUpdate(scope.songs[id]);
			});
			
			it('preps the modal for update', function(){
				expect(scope.songEditModalMode).toBe("UPDATE");
				expect(scope.songEditModalTitle).toBe("Update Song");
				expect(scope.songEditTitleValid).toBeTrue();
			});
			
			it('updates the song', function(){
				var titleForUpdate = 'UNIQUE_SONG_TITLE';
				scope.pending['title'] = titleForUpdate;
			
				scope.commitUpdate();
				
				expect(scope.songEditTitleValid).toBeTrue();
				expect(scope.songs[id]['title']).toBe(titleForUpdate);
			});
			
			it('does not update with an empty title', function(){
				var titleForUpdate = '';
				scope.pending['title'] = titleForUpdate;
				
				scope.commitUpdate();
				
				expect(scope.songEditTitleValid).toBeFalse();
				expect(scope.songs[id]['title']).toBe(title);
			});
		
		});
	
	});

});