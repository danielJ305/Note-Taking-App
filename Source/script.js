/* DOM */
var NoteController = (function () {

    var Note = function (id, title, text) {
        this.id = id;
        this.title = title;
        this.text = text;
    };

    var data = {
        notes: []
    };

    return {
        newNote: function (title) {
            var newNote, ID, Title;
            Title = title.title;

            if (data.notes.length > 0) {
                ID = data.notes[data.notes.length - 1].id + 1;
            } else {
                ID = 0;
            }

            newNote = new Note(ID, Title, '');

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

        cardClick: function (e) {
            console.log(e);
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
        noteCardContainer: '.notes-container',
        workingTabID_DIV: '.text-title',
        workingTabTitle: '#note-working-title',
        workingTabText: '#text',
        noteWrapper: '.note-wrapper',
        noteCardAnchor: '#note-card-anchor'
    };

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

            element = DOMStrings.noteCardContainer;

            html = `<div class="note-wrapper note-card" id="note-%id%">
                        <label id="note_card_title">%title%</label>
                        <p id="note_cardPreview_text">%text%</p>
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

        $(DOM.bodyWrapper).on('click', eventHandler);

        function eventHandler(e) {
            if (e.target !== e.target.id) {

                var clickedItemID = e.target.id;
                var regex = /note./gi;

                if ('#' + clickedItemID === DOM.addNote) {
                    ctrlAddNewNote();
                } else if ('#' + clickedItemID === DOM.saveButton) {
                    ctrlSaveNote();
                } else if (clickedItemID.match(regex)) {
                    ctrlClickCard();
                }
            }

            e.stopPropagation();
        }



        // document.addEventListener('keypress', function (event) {
        //     if (event.keyCode === 13 || event.which === 13) {
        //         ctrlAddNewNote();
        //     } else {
        //         return;
        //     }
        // });
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
        var workingInput, currentNote;
        // 1 - Get the input from the working tab
        workingInput = UICtrl.getWorkingTabNote();
        // 2 - Update the data structure
        updateData = NoteCtrl.dataUpdator(workingInput);
        // 3 - Update the note card in the note Container
        UICtrl.updateNoteCard(updateData);
    };

    var ctrlClickCard = function (e) {
        var element, workingNoteData;
        // Listen for click on card
        element = e;
        // Retrieve required Data from NoteCtrl
        workingNoteData = NoteCtrl(element);
        // Add note to the working tab
    }

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

        // console.log(textWrapperWidth)
        $(DOM.newTitle).width(textWrapperWidth);
    }

    window.onresize = updateInput;
    window.onload = updateInput;
    // return {
    //     init: function () {

    //     }
    // };

})(UIController);


Controller.init();



/* _______________________________ */