// <copyright file="linking_words.js">
// Copyright (c) Michał Katański 2015. All Right Reserved
// </copyright>
//
// <author>Michał Katański</author>
// <date>2015-04-28</date>
// <summary>InDesign CC 2014 script. Moves characters from the end of the line to next line</summary>

var config = {
    allowedApplications: ['Adobe InDesign'],
    allowedElementTypes: [
        'Cell', 'Character', 'Column', 'Line', 'Paragraph', 'Row', 'Story', 'Table', 'Text',
        'TextColumn', 'TextFrame', 'TextStyleRange', 'TextPath', 'Word'
    ],
    chars: ['a', 'i', 'o', 'u', 'w', 'z', 'A', 'I', 'O', 'U', 'W', 'Z']
};


/**
 * Find element in array
 * 
 * @param element element to find
 * @returns {number} index of element or -1 if not exists
 */
Array.prototype.indexOf = function(element) {
    var length = this.length;

    for (var i = 0; i < length; i++) {
        if (this[i] === element) {
            return i;
        }
    }

    return -1;
};

/**
 * Append text frames objects to selection list
 *
 * @param curObject to seek for text frames objects
 * @param length number of text frames objects in document
 * @param selectedElements array of selected elements
 */
function appendTextFramesToSelection(curObject, length, selectedElements) {
    for (var tfIndex = 0; tfIndex < length; tfIndex++) {
        if (curObject.textFrames[tfIndex].contents.length > 1) {
            selectedElements.push(curObject.textFrames[tfIndex]);
        }
    }
    return selectedElements;
}

/**
 * If application is not allowed or there is no open document terminate script
 */
function checkCurrentApplication() {   
    if (config.allowedApplications.indexOf(app.name) === -1) {
        alert('Invalid application. Script terminated.');
        exit();
    }

    if (app.documents.length === 0) {
        alert('No open document found. Script terminated.');
        exit();
    }
}

/**
 * Get all selected text elements
 */
function getSelectedElements() {
    var selectedElements = [],
        selectionLength = app.selection.length;
    
    for (var x = 0; x < selectionLength; x++) {
        var elementType = app.selection[x].constructor.name,
            selContentsLength = app.selection[x].contents.length,
            appSelection = app.selection[x];

        if (config.allowedElementTypes.indexOf(elementType) > -1 && selContentsLength > 1) {
            selectedElements.push(appSelection)
        }

        if (elementType == 'Group') {
            var textFramesLength = appSelection.textFrames.length,
                groupsLength = appSelection.groups.length;

            selectedElements = appendTextFramesToSelection(appSelection, textFramesLength, selectedElements);

            for (var gIndex = 0; gIndex < groupsLength; gIndex++) {
                selectedElements = appendTextFramesToSelection(
                    appSelection.groups[gIndex], 
                    textFramesLength, 
                    selectedElements);
            }
        }
    }
    
    return selectedElements;
}

function buildGreps() {
    var charsLength = config.chars.length,
        greps = [];
    
    for (var charIndex = 0; charIndex < charsLength; charIndex++) {
        greps.push({
            find: config.chars[charIndex] + '\r+',
            changeTo: '\r' + config.chars[charIndex] + ' '
        });
    }

    // Replace double spaces into single spaces
    greps.push({find: '  +', changeTo: ' '});

    return greps;
}

/**
 * Main function
 */
function main() {
    
    checkCurrentApplication();

    var selectedElements = getSelectedElements(),
        greps = buildGreps();

    var selElementsLength = selectedElements.length;

    for(var i = 0; i < greps.length; i++){
        app.findGrepPreferences.findWhat = greps[i].find;
        app.changeGrepPreferences.changeTo = greps[i].changeTo;

        if (selElementsLength > 0) {
            // apply to only selected elements
            for (var elemIndex = 0; elemIndex < selElementsLength; elemIndex++) {
                selectedElements[elemIndex].changeGrep();
            }
        } else {
            // apply to document
            app.activeDocument.changeGrep();
        }

        app.findGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences = NothingEnum.nothing;
    }

    if (selElementsLength > 0) {
        alert("Applied to selected elements.");
        return
    }
    alert("No selection. Applied to active document.");
    
}

main();
