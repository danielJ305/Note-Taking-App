
/* DOM */
var NoteController = (function () {

    var Note = function (id, title, text) {
        this.id = id;
        this.title = title;
        this.text = text;
    };

    var data = {
        notes: [{id: 0, title: "First Note", text: "Click this card to edit your note."}]
    };

    return {
        newNote: function (title) {
            var newNote, ID;

            if (data.notes.length > 0) {
                ID = data.notes[data.notes.length - 1].id + 1;
            } else {
                ID = 0;
            }

            newNote = new Note(ID, title.title, '');

            data.notes.push(newNote);
            return newNote;
        },

        dataUpdator: function (workingInput) {
            var noteID, regex, currentNote;

            // if card exists in  data, do this
            for (let i = 0; i < data.notes.length; i++) {

                noteID = workingInput.id;
                regex = /[0-9]/;

                if (parseInt(noteID.match(regex)[0]) === data.notes[i].id) {
                    // update current note
                    data.notes[i].title = workingInput.title;
                    data.notes[i].text = workingInput.text;

                    currentNote = data.notes[i];
                }
            }

            // (return the updated note from the note database) to update UI of note card
            return currentNote;
        },

        deleteNote: function(id) {
            var ids, index, ID;
            ID = parseFloat(id);

            ids = data.notes.map(cur => cur.id);

            index = ids.indexOf(ID);
            console.log(ids, index);
            if (index != -1) {
                data.notes.splice(index, 1);
            }
        },

        returnData: function () {
            return data;
        }

    };



})();

var UIController = (function () {
    var DOMStrings = {
        bodyWrapper: '#body_wrapper',
        noteContainer: '.notes-container',
        newTitle: '#new_title_field',
        addNote: '#add_note_btn',
        saveButton: '#save_button',
        noteCard: '.note-card',
        workingNote: '#text_tab',
        workingTabID_DIV: '.text-title',
        workingTabTitle: '#note-working-title',
        workingTabText: '#text',
        noteWrapper: '.note-wrapper',
        noteCardAnchor: '#note-card-anchor',
        deleteButton: '.delete-button'
    };

    function textAreaFocus () {
        $(DOMStrings.workingTabText).focus();
    }

    return {
        getNewInput: function () {
            return {
                title: document.querySelector(DOMStrings.newTitle).value
            };
        },

        getWorkingTabNote: function () {
            return {
                id: document.querySelector(DOMStrings.workingTabID_DIV).id,
                title: $(DOMStrings.workingTabTitle).text(),
                text: document.querySelector(DOMStrings.workingTabText).value
            };
        },

        addNoteCard: function (obj) {
            var html, newHTML, element, cardPlaceholder;

            element = DOMStrings.noteContainer;

            html = `<div class="note-wrapper note-card" id="note-%id%">
                        <label id="note_card_title">%title%</label>
                        <p id="note_cardPreview_text">%text%</p>
                        <img class="delete-button" id="dlt_btn" src="Media/closeB.png" alt="delete">
                    </div>`;

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%title%', obj.title);

            if (obj.text === '') {
                cardPlaceholder = 'Write something in your note...';
                newHTML = newHTML.replace('%text%', cardPlaceholder);
            } else {
                newHTML = newHTML.replace('%text%', obj.text);
            }

            document.querySelector(element).insertAdjacentHTML("afterbegin", newHTML);
            textAreaFocus();
        },

        updateNoteCard: function (obj) {
            var ID, Title, LongText, Text, cardContainer;

            ID = obj.id;
            Title = obj.title;
            Text = obj.text + '...';
            cardContainer = $(`#note-${ID}`);

            if (Text.length > 100) {
                LongText = textLimit(obj.text);
                cardContainer.children('p').html(LongText);
            } else {
                cardContainer.children('p').html(Text);
            }

            function textLimit(text) {
                var textArr;
                var textLimit = [];
                textArr = text.split('');


                for (let i = 0; i <= 100; i++) {
                    textLimit += textArr[i];
                }

                return textLimit + '...';

            }

            cardContainer.children('label').html(Title);
            textAreaFocus()
        },

        addWorkingNote: function (obj) {
            var html, newHTML, element;

            element = DOMStrings.workingNote;

            html = `<div class="text-title" id="note-%id%">
                    <h2 contenteditable="true" id="note-working-title">%title%</h2>
                    <button id="save_button">SAVE</button>
                </div>
                <div class="text-body">
                    <textarea name="note-text" id="text" cols="30" rows="10">%text%</textarea>
                </div>`;

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%title%', obj.title);
            newHTML = newHTML.replace('%text%', obj.text);

            document.querySelector(element).innerHTML = '';
            document.querySelector(element).insertAdjacentHTML("afterbegin", newHTML);
            textAreaFocus();
        },

        deleteNoteUI: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        returnData: function() {
            return data;
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.newTitle);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = '';
            });
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();


/* -- CONTROLLER -- */

var Controller = (function (UICtrl, NoteCtrl) {

    var eventlisteners = function () {
        var DOM = UICtrl.getDOMStrings();

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddNewNote();
            } else {
                return;
            }

        });

        $(document).on('click', DOM.addNote, ctrlAddNewNote);
        $(document).on('click', DOM.saveButton, ctrlSaveNote);
        $(document).on('click', DOM.noteContainer, ctrlClickCard);
        $(document).on('click', DOM.deleteButton, ctrldeleteNote);

    };

    var ctrlAddNewNote = function () {
        var newInput, newNote;
        // 1 - Get the new title note. 
        newInput = UICtrl.getNewInput();
        // 2 - Add a new note in the data Object structure.
        newNote = NoteCtrl.newNote(newInput);
        // 3 - Add note to the working tab
        UICtrl.addWorkingNote(newNote);
        // 4 - Add a note card to the note container
        UICtrl.addNoteCard(newNote);
        UICtrl.clearFields();
    };

    var ctrlSaveNote = function () {
        var workingInput;
        // 1 - Get the input from the working tab
        workingInput = UICtrl.getWorkingTabNote();
        // 2 - Update the data structure
        updateData = NoteCtrl.dataUpdator(workingInput);
        // 3 - Update the note card in the note Container
        UICtrl.updateNoteCard(updateData);

    };

    var ctrlClickCard = function (e) {
        var data, workingTab, obj;
        workingTab = UICtrl.getWorkingTabNote();
        data = NoteCtrl.returnData();

        // 1 - Ask if you would like to save the note
        function matcher() {
            var itemID, splitID, ID;
            var i = 0;

            while (i < data.notes.length) {
                itemID = workingTab.id;
                splitID = itemID.split('-');
                ID = parseFloat(splitID[1]);

                if (ID === data.notes[i].id) {
                    if (data.notes[i].title === workingTab.title && data.notes[i].text === workingTab.text) {
                        workingNote();
                    } else {
                        $( "#dialog-confirm" ).dialog({
                            resizable: false,
                            height: "auto",
                            width: 400,
                            modal: true,
                            buttons: {
                            "Save Note": function() {
                                $( this ).dialog( "close" );
                            
                                ctrlSaveNote();
                                workingNote();
                            },
                            "No": function() {
                                $( this ).dialog( "close" );

                                workingNote();
                            }
                            }
                        });
                    };
                }
                i++;
            }
        }

        function workingNote() {
            var itemID, splitID, ID;
            var i = 0;

            while (i < data.notes.length) {
                itemID = e.target.id;
                splitID = itemID.split('-');
                ID = parseFloat(splitID[1]);

                if (ID === data.notes[i].id) {
                    obj = data.notes[i];
                    UICtrl.addWorkingNote(obj);
                }
                i++;
            }
        }

        matcher();        
    };

    var ctrldeleteNote = function(e) {
        var itemID, splitID, ID;
        console.log(e.target.parentElement)
        itemID = e.target.parentElement.id;

        if (itemID) {
            splitID = itemID.split('-');
            ID = (splitID[1]);

            NoteCtrl.deleteNote(ID);

            UICtrl.deleteNoteUI(itemID)
        }
        
    };

    return {
        init: function () {
            // inputSize.init();
            eventlisteners();
        }
    };
    
})(UIController, NoteController);


/** Input field resize responsive **/

// Have a listener for screen resize that calls a function
// to get the width of the notes container and apply it
// to the input field.

var inputSize = (function (UICtrl) {

    var DOM = UICtrl.getDOMStrings();

    function updateInput() {
        var textWrapperWidth = $(DOM.noteContainer).width();

        $(DOM.newTitle).width(textWrapperWidth);
    }

    window.onresize = updateInput;
    window.onload = updateInput;
    

})(UIController);


Controller.init();



/* _______________________________ */