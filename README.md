# Remove Orphans Script
> InDesign CS6 - CC 2014 script for removing orphans in text

![compatible](http://i.imgur.com/OUGtXGD.png)

This script helps user to remove orphans from the end of the line. To use it simply copy `orphan_remove.js` file into your InDesign scripts folder. More information about installing scripts is in `installing` section of this document.

The script can be used on selected objects or the entire active document.

Script supports following languages:
- Polish
- Czech

It should work with inDesign CS6 and above

## <a name="Using"></a> Using the script

If you want to use the script only on selected objects, select them first. If you do not, the entire text contained in the active document will be processed.

Then run the script. Will appear the main window of the script. Select the language you want to use. Language selection determines the type of conjunctions that the script should consider. Selected language of the text in InDesign, as well as the InDesign interface language does not affect the operation of the script.

![mainwindow](http://i.imgur.com/rS0Nk6j.png)

Press 'OK'.

After a short while the text should be cleansed of 'hanging conjunctions'.

![finishwindow](http://i.imgur.com/LPwqRAL.png)

## <a name="Issues"></a> Issues

If you find an issue when using a script and / or have suggestions and comments to its actions, please write it in the list included here: https://github.com/mkatanski/Remove-Orphans-Script/issues

## <a name="Installing"></a> Installing scripts

There are two places you can install scripts in InDesign: The application folder and the user script folder. The easiest way to find these folders is to open the Scripts panel in InDesign (Window > Automation > Scripts in CS3 and CS4; or Window > Utilities > Scripts in CS5 or later), then right-click on either Application or User. We tend to use "User" for scripts that we've downloaded, but it's up to you and the permissions you have on your computer. From the context menu, choose Reveal in Finder (or Reveal in Windows Explorer).

![revelafinder](http://indesignsecrets.com/wp-content/uploads/2006/01/revealinfinder.gif)

Inside the folder that opens there is a folder called Scripts panel. Put your scripts inside that.
Any script inside the Scripts Panel folder will show up immediately in InDesign. No need to restart the program.

## <a name="Contributing"></a> Contributing
In lieu of a formal style guide, take care to maintain the existing coding style.

If you want to create new feature or fix bug, do following steps

- Create fork of linking-words-script repository
- Create new branch
- Submit a PR
