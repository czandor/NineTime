<html>
    <head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
        <title>czandor.hu NineTime for Pebble</title>

        <style>
            *{
                box-sizing: border-box;
            }
            body {
                background-color: #F4F3F4;
                color: #222;
                padding: 0;
                font-family: PFDinDisplayPro-Regular,PFDinDisplayProRegularWebfont,sans-serif;
                font-weight: 400;
                font-style: normal;
                line-height: 1;
                position: static;
                cursor: default;
                margin: 0 auto;
                padding-top: 50px;
                /*max-width: 720px;*/
            }
            pre {
                font-family: inherit;
                font-size: 1em;
                line-height: 1.6;
                text-rendering: auto;
                white-space: pre-line;
            }
            .app-changelog.ng-scope{
                width: 100%;
                margin-bottom: 50px;
            }
            blockquote, dd, div, dl, dt, form, h1, h2, h3, h4, h5, h6, li, ol, p, pre, td, th, ul {
                margin: 0;
                padding: 0;
                direction: ltr;
            }
            .app-changelog h2 {
                color: #959595;
                font-size: 1.0125em;
                margin: 15px 10px 5px;
                text-transform: uppercase;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                line-height: 17px;
            }
            .app-changelog pre {
                width: 100%;
                color: #777;
                background: #fff;
                padding: 10px;
                font-size: 1em;
                font-style: normal;
                line-height: 1.6;
            }
            .changelog-date {
                font-size: .9em;
                text-align: right;
                vertical-align: middle;
                position: absolute;
                right: 10px;
            }
        </style>
    </head>
<body>
    <h2 style="width: 100%; text-align: center; padding: 10px; position: fixed; top: 0;background-color: #C9C9C9; z-index: 999;">
      Changelog
    </h2>

    <div class="app-changelog ng-scope">
      <h2>Version 2.00 <span class="changelog-date">Oct 31, 2026</span></h2>
      <pre>- Replaced legacy weather providers with Open-Meteo and MET Norway. No account or API key required.
- Current weather and the next 24 hours' forecast share one cached request.
- Phone GPS or city search, metric/imperial units, and English/Hungarian/German condition text.
- Removed old key distribution, developer-key workarounds, and weather statistics.
- Kept legacy weather URLs and response formats, now backed by new keyless weather data.
- Original 1.92 graphics and watch platforms retained. Pebble Time 2 support is planned for 3.xx.</pre>
  <!-- ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.92
      <span class="changelog-date ng-binding">Apr 13, 2018</span>
    </h2>
      <pre class="app-value ng-binding">- Reenabled Upcoming holidays for Aplite (classic and steel)
 - Now compatible with Gadgetbridge companion app (with some restriction*)
 
 *Details for Gadgetbridge companion app: Weather is working, but no wind speed, and no forecast. Info script is not working because of internet permission restrictions in gadgetbridge app.</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.91
      <span class="changelog-date ng-binding">Mar 9, 2018</span>
    </h2>
      <pre class="app-value ng-binding">- Memory optimization
- Temporarily disabled 'upcoming holidays' for Aplite platform (low memory)</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.90
      <span class="changelog-date ng-binding">Mar 9, 2018</span>
    </h2>
      <pre class="app-value ng-binding">- Added Week Number to vertical complications.
- Now you can invert the screen when phone is disconnected whether with or without the icon. Can be enabled in 'Vibration and Alert setting'.
- Inverting screen when disconnect is surprisingly useful, thanks to Thanos for the suggestion.
- Debug screen in the 'Load / Save' section of the settings. Useful when you are testing your own info script.</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.81
      <span class="changelog-date ng-binding">Feb 18, 2018</span>
    </h2>
      <pre class="app-value ng-binding">- Fix Upcoming Holidays texts</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.80
      <span class="changelog-date ng-binding">Jan 6, 2018</span>
    </h2>
      <pre class="app-value ng-binding">- 2 new font types, LECO1976 and BosaNova
- Thanks for the 200 hearts :)</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.70
      <span class="changelog-date ng-binding">Dec 8, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Thanks to big memory optimization, now the upcoming holidays also available on aplite platform (Pebble Classic and Steel).
- Upcoming holidays now in new look, better reading for day countdown.
- Option to show seconds on vertical and/or horizontal place. Use show on tap/shake to reduce battery usage!
- More option for today's date (month name, day name mixing).
- Better algorithm to calculate vertical icon sizes, so that fewer icons are converted into a compact view.</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.65
      <span class="changelog-date ng-binding">Nov 26, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Upcoming Holidays removed from Old Pebbles (Aplite platform) because of memory limitation. Please give me a few days to fix this for Pebble Classic and Steel users.</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.64
      <span class="changelog-date ng-binding">Nov 26, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Option to add Digital time and/or Date to analog face
- Option to add Day-name to horizontal date format
- New Horizontal status, Countdown for upcoming Holidays, Now for Christian holidays. For other religions please contact me.</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.63
      <span class="changelog-date ng-binding">Nov 18, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Quick bugfix again, sorry (health data displays zero)</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.62
      <span class="changelog-date ng-binding">Nov 18, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Fixed Pebble Time Round horizontal health data positioning problem</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.61
      <span class="changelog-date ng-binding">Nov 17, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Refined some icons and icon-positions
- More variation for vertical column items (good for Time Round)
- Periodic vibration bug-fix: sometimes vibrated more then once in a minute</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.60
      <span class="changelog-date ng-binding">Nov 12, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Now you can control the status icon, when you want to show on watch
- Option to disable connection check between phone and watch, good for iPhone users who always closing Pebble App
- New weather provider: Yahoo! weathers
- Weather condition text on watch
- More option to show Weather current humidity and wind
- Weather stability improvements
- Icon and text positioning improvements
- Visual feedback on config page for vertical icons</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.51
      <span class="changelog-date ng-binding">Oct 24, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Download error status bugfix</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.50
      <span class="changelog-date ng-binding">Oct 24, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Now you can colorize separately Analog Watchface minute and hourhand, face and background
- Horizontal Current Weather status now shows Humidity
- New Vertical status, Current Wind speed and Humidity
- Optimized Weather and Info script download period (less battery and server resources usage)
- WeatherUnderground Forecast now calculate from today and tomorrow weather instead of just today
- New design for Pebble Time Round (again, because I got one for test)
- Some bugfix
On next update: More minute based watchface style, Info script improvements</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.41
      <span class="changelog-date ng-binding">Oct 17, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Support longer text fields (increased char array sizes) 
- Fixed Weather City manual adding bug 
- Fixed vertical bottom icon errors caused by buffer overflow bug 
- Fixed config page layout error on iPhone 5S and SE
- Speed improvements on Pebble 2 (Slow BT)</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.3
      <span class="changelog-date ng-binding">Oct 15, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- New design for Pebble Round
- Fix delta steps for info script calculation bug</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.2
      <span class="changelog-date ng-binding">Oct 14, 2017</span>
    </h2>
      <pre class="app-value ng-binding">- Battery optimization
- Fixed some icons
- Bugfix: config page not loading on iPhone</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.1
      <span class="changelog-date ng-binding">Oct 13, 2017</span>
    </h2>
      <pre class="app-value ng-binding">No information available</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog --><!-- ngIf: ::changelog --><div ng-repeat="item in ::changelog" ng-if="::changelog" class="ng-scope">
    <h2 class="ng-binding">
      Version 1.0
      <span class="changelog-date ng-binding">Oct 13, 2017</span>
    </h2>
      <pre class="app-value ng-binding">Initial release</pre>
  </div><!-- end ngIf: ::changelog --><!-- end ngRepeat: item in ::changelog -->
  <!-- ngIf: ::!changelog -->
</div>

</body>
</html>
