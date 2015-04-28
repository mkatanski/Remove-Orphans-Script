// <copyright file="orphan_remove.js">
// Copyright (c) Michał Katański 2015. All Right Reserved
// </copyright>
//
// <author>Michał Katański</author>
// <date>2015-04-28</date>
// <summary>InDesign CC 2014 script. Removes orphans from text</summary>

var config = {
    allowedApplications: ['Adobe InDesign'],
    allowedElementTypes: [
        'Cell', 'Character', 'Column', 'Line', 'Paragraph', 'Row', 'Story', 'Table', 'Text',
        'TextColumn', 'TextFrame', 'TextStyleRange', 'TextPath', 'Word'
    ],
    chars: {
        "Polski": ['a', 'i', 'o', 'u', 'w', 'z', 'A', 'I', 'O', 'U', 'W', 'Z'],
        "Cesky": ['a', 'i', 'k', 'o', 's', 'u', 'v', 'z', 'A', 'I', 'K', 'O', 'S', 'U', 'V', 'Z']
    }
};


/**
 * Find element in array
 *
 * @param element element to find
 * @returns {number} index of element or -1 if not exists
 */
Array.prototype.indexOf = function (element) {
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
    var charsLength = config.selectedChars.length,
        greps = [];

    for (var charIndex = 0; charIndex < charsLength; charIndex++) {
        greps.push({
            find: config.selectedChars[charIndex] + '\r+',
            changeTo: '\r' + config.selectedChars[charIndex] + ' '
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

    var names = [],
        proceed = true;

    for (var key in config.chars) {
        names.push(key);
    }

    var dialogWindow = new Window("dialog", "Linking Words", undefined, {closeButton: false});
    dialogWindow.alignChildren = "right";
    var mainGroup = dialogWindow.add("group");
    mainGroup.add("statictext", undefined, "Language: ");

    var group = mainGroup.add("group {alignChildren: 'left', orientation: 'stack'}");

    var list = group.add("dropdownlist", [0, 0, 240, 20], names);
    list.minimumSize.width = 220;
    list.selection = 0;


    var buttons = dialogWindow.add("group");
    buttons.add("button", undefined, "OK", {name: "ok"});
    cancelButton = buttons.add("button", undefined, "Cancel", {name: "cancel"});

    cancelButton.onClick = function () {
        proceed = false;
        dialogWindow.hide();
    };

    var footer = dialogWindow.add("group");
    footer.add("statictext", undefined, "Copyright Michał Katański 2015");

    dialogWindow.show();

    if (!proceed) {
        return
    }

    var progressWindow = new Window("palette", "Linking Words", undefined, {closeButton: false});
    progressWindow.add("statictext", undefined, "Processing text... please wait.");
    progressWindow.show();

    config.selectedChars = config.chars[list.selection];

    var selectedElements = getSelectedElements(),
        greps = buildGreps();

    var selElementsLength = selectedElements.length;

    for (var i = 0; i < greps.length; i++) {
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

    progressWindow.hide();

    var finishWindow = new Window("dialog", "Linking Words", undefined, {closeButton: true});

    finishWindow.add("statictext", undefined, "Finished !!!");

    if (selElementsLength > 0) {
        finishWindow.add("statictext", undefined, "Applied to selected elements.");
    } else {
        finishWindow.add("statictext", undefined, "No selection. Applied to active document.");
    }

    finishWindow.add("button", undefined, "Close", {name: "ok"});
    finishWindow.show();

}

main();
