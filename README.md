# SongLibrary
Welcome to SongLibrary, a single page application for maintaining your own personal song library.
Here is a link to the [SongLibrary app hosted on Github pages](https://khalemano.github.io/SongLibrary/songlist.html).
You should also be able to run the songlist.html page locally by cloning the repository.
The following sections explain the structure of the app and the decisions that went into it's creation.

## Frontend Logic
The frontend was written using the [AngularJS framework](https://angularjs.org/).
AngularJS is nice because it provides a comprehensive model-view-controller system.
This keeps the view (songlist.html) concerned mostly with view related business and allows the heavy lifting to be done by the controller (app.min.js).
Because so much of the logic is contained in the javascript file, I included the non-minimized version in this github repo (app.js).

## CSS
The style of the page was coded using [Bootstrap](https://getbootstrap.com/).
The Bootstrap modal was utilized to create a popup to gather song information from the user when the user wants to update or add a song.
Modifications were made to the CSS to conform more to the style of the [PERA website](https://www.copera.org).

## Tests
The unit tests were written in Jasmine.
You can see the written tests in the app.spec.js file.
You can run the tests by viewing the [SpecRunner page](https://khalemano.github.io/SongLibrary/test/SpecRunner.html).

## Backend
The backend of the app is a [Glassfish server](https://javaee.github.io/glassfish) hosted on [Amazon Web Services](https://aws.amazon.com/) that serves a static song list, that way you can reset the song list by refreshing your browser.
