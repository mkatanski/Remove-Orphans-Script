// <copyright file="orphan_remove.js">
// Copyright (c) Michał Katański 2015. All Right Reserved
// </copyright>
//
// <author>Michał Katański</author>
// <date>2015-04-28</date>
// <summary>Script for InDesign CS6 - CC 2014. Removes orphans from text</summary>

#targetengine "session"

//________________________________________________________________________________________________
//                                                                                GLOBAL VARIABLES

var config = {
    scriptTitle: 'Remove Orphans v.0.2.3',
    UIText: {
        mainWindow: {
            footerText: 'https://github.com/mkatanski/Remove-Orphans-Script',
            dropLabel: 'Text language: '
        },
        progressWindow: {
            message: 'Processing text... please wait.'
        },
        finalWindow: {
            Title: 'Script finished successfully!',
            noSelection: 'Orphans has been removed in selected elements.',
            selection: 'Orphans has been removed in whole document.'
        },
        general: {
            okBtn: 'OK',
            cancelBtn: 'Cancel',
            closeBtn: 'Close',
            noDocError: 'No open document found. Script terminated.',
            wrongAppError: 'Invalid application. Script terminated.'
        }
    },
    allowedApplications: ['Adobe InDesign'],
    allowedElementTypes: [
        'Cell', 'Character', 'Column', 'Line', 'Paragraph', 'Row', 'Story', 'Table', 'Text',
        'TextColumn', 'TextFrame', 'TextStyleRange', 'TextPath', 'Word'
    ],
    chars: {
        "Polish": ['a', 'i', 'o', 'u', 'w', 'z', 'A', 'I', 'O', 'U', 'W', 'Z'],
        "Czech": ['a', 'i', 'k', 'o', 's', 'u', 'v', 'z', 'A', 'I', 'K', 'O', 'S', 'U', 'V', 'Z']
    }
};

//________________________________________________________________________________________________
//                                                                            HELPERS & PROTOTYPES

/**
 * Get element index from array
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

//________________________________________________________________________________________________
//                                                                                    CORE METHODS

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
        alert(config.UIText.general.wrongAppError);
        exit();
    }

    if (app.documents.length === 0) {
        alert(config.UIText.general.noDocError);
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
        var cchar = config.selectedChars[charIndex];
        greps.push({
            find: '\\<' + cchar + '\\s+',
            changeTo: cchar + '~S'
        });
    }

    return greps;
}

function doCompute() {

    var finishWindowMessage = '',
        progressWindow = createProgressWindow(),
        selectedElements = getSelectedElements(),
        selElementsLength = selectedElements.length,
        greps = buildGreps();

    progressWindow.show();

    for (var i = 0; i < greps.length; i++) {
        app.findGrepPreferences.findWhat = greps[i].find;
        app.changeGrepPreferences.changeTo = greps[i].changeTo;
        app.changeGrepPreferences.noBreak = false;

        if (selElementsLength > 0) {
            // apply to only selected elements
            for (var elemIndex = 0; elemIndex < selElementsLength; elemIndex++) {
                selectedElements[elemIndex].changeGrep();
            }
            finishWindowMessage = config.UIText.finalWindow.selection;
        } else {
            // apply to document
            app.activeDocument.changeGrep();
            finishWindowMessage = config.UIText.finalWindow.noSelection;
        }

        app.findGrepPreferences = NothingEnum.nothing;
        app.changeGrepPreferences = NothingEnum.nothing;
    }

    progressWindow.hide();
    createFinishWindow(finishWindowMessage).show();
}

//________________________________________________________________________________________________
//                                                                                 UI CONSTRUCTORS

function createMainWindow() {
    var languages = [];

    for (var key in config.chars) {
        languages.push(key);
    }

    var window = new Window('window', config.scriptTitle, undefined, {closeButton: false});
    window.alignChildren = 'right';
    var mainGroup = window.add('group');
    mainGroup.add('statictext', undefined, config.UIText.mainWindow.dropLabel);

    var group = mainGroup.add('group {alignChildren: "left", orientation: "stack"}');

    var list = group.add('dropdownlist', [0, 0, 240, 20], languages);
    list.minimumSize.width = 220;
    list.selection = 0;

    var buttons = window.add('group');
    okButton = buttons.add('button', undefined, config.UIText.general.okBtn, {name: 'ok'});
    cancelButton = buttons.add('button', undefined, config.UIText.general.cancelBtn, {name: 'cancel'});

    var footer = window.add('group');
    footer.add('statictext', undefined, config.UIText.mainWindow.footerText);

    cancelButton.onClick = function () {
        window.hide();
    };

    okButton.onClick = function () {
        config.selectedChars = config.chars[list.selection];
        window.hide();
        doCompute();
    };

    return window;
}

function createProgressWindow() {
    var window = new Window('palette', config.scriptTitle, undefined, {closeButton: false});
    window.add('statictext', undefined, config.UIText.progressWindow.message);
    return window;
}

function createFinishWindow(message) {
    var window = new Window('dialog', config.scriptTitle, undefined, {closeButton: true});
    window.add('statictext', undefined, config.UIText.finalWindow.Title);
    window.add('statictext', undefined, message);
    closeBtn = window.add('button', undefined, config.UIText.general.closeBtn, {name: 'close'});
    closeBtn.onClick = function () {
        window.hide();
    };
    return window;
}

//________________________________________________________________________________________________
//                                                                              SCRIPT CONSTRUCTOR

checkCurrentApplication();
createMainWindow().show();
