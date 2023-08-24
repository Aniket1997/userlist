$(document).ready(async function () {
    const form = $('#dataForm');
    const tableBody = $('#dataTable tbody');
$(document).ready(async function () {
    const form = $('#dataForm');
    const tableBody = $('#dataTable tbody');

    async function fetchData() {
        const response = await fetch('http://localhost:3000/data');
        const data = await response.json();
        data.forEach(entry => {
            entry.dateOfBirth = new Date(entry.dateOfBirth);
        });
        return data;
    }


    async function renderData() {
        const data = await fetchData();
        data.sort((a, b) => a.age - b.age);
        tableBody.empty();
        tableBody.empty();
        data.forEach(entry => {
            const dobFormatted = entry.dateOfBirth.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const newRow = $('<tr></tr>');
            newRow.html(`

            const newRow = $('<tr></tr>');
            newRow.html(`
                <td>${entry.name}</td>
                <td>${dobFormatted}</td>
                <td style="text-align: center">${entry.age}</td>
                <td class="action-buttons">
                    <button class="edit-button" data-id="${entry.id}">Edit</button>
                    <button class="delete-button" data-id="${entry.id}">Delete</button>
                </td>`);
            tableBody.append(newRow);
        });
    }


    async function updateData(id, name, dateOfBirth, age) {
        const response = await fetch(`http://localhost:3000/data/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, dateOfBirth, age })
            body: JSON.stringify({ name, dateOfBirth, age })
        });
        return response.ok;
    }


    async function deleteData(id) {
        const response = await fetch(`http://localhost:3000/data/${id}`, {
            method: 'DELETE'
        });
        return response.ok;
    }

    async function handleEditClick(row) {
        const id = $(row).find('.edit-button').data('id');
        const nameCell = $(row).find('td:nth-child(1)');
        const dobCell = $(row).find('td:nth-child(2)');
        const ageCell = $(row).find('td:nth-child(3)');
        const actionCell = $(row).find('.action-buttons');

        const name = nameCell.text();
        const dob = dobCell.text();
        const age = ageCell.text();

        nameCell.html(`<input type="text" class="edit-name" value="${name}" style="width: 180px;" />`);
        dobCell.html(`<input type="date" class="edit-dob" value="${dob}" style="width: 98%;
        const id = $(row).find('.edit-button').data('id');
        const nameCell = $(row).find('td:nth-child(1)');
        const dobCell = $(row).find('td:nth-child(2)');
        const ageCell = $(row).find('td:nth-child(3)');
        const actionCell = $(row).find('.action-buttons');

        const name = nameCell.text();
        const dob = dobCell.text();
        const age = ageCell.text();

        nameCell.html(`<input type="text" class="edit-name" value="${name}" style="width: 180px;" />`);
        dobCell.html(`<input type="date" class="edit-dob" value="${dob}" style="width: 98%;
        border-radius: 6px;
        height: 41px;
        border: 1px solid #c5c5c5;" />`);
        ageCell.html(`<span class="edit-age">${age}</span>`);
        $(row).find('.edit-button').text('Save');

        actionCell.addClass('expanded-cell');
        border: 1px solid #c5c5c5;" />`);
        ageCell.html(`<span class="edit-age">${age}</span>`);
        $(row).find('.edit-button').text('Save');

        actionCell.addClass('expanded-cell');
    }


    async function handleSaveClick(row) {
        const id = row.querySelector('.edit-button').dataset.id;
        const newName = row.querySelector('.edit-name').value;
        const newDob = row.querySelector('.edit-dob').value;
    
        // Calculate new age based on the updated date of birth
        const dob = new Date(newDob);
        const today = new Date();
        const newAge = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
    
        const success = await updateData(id, newName, newDob, newAge); // Pass newAge to updateData
    
        if (success) {
            await renderData();
        }

        $(row).find('.delete-button').css('display', 'block');
        const actionCell = $(row).find('.action-buttons');
        actionCell.removeClass('expanded-cell');
    }
    
    

    


    async function handleDeleteClick(id) {
        const success = await deleteData(id);

        if (success) {
            await renderData();
            await renderData();
        }
    }

    form.on('submit', async function (e) {
        e.preventDefault();

        const nameInput = $('#name');
        const dateOfBirthInput = $('#dateOfBirth');
        const ageInput = $('#age');

        const name = nameInput.val();
        const dateOfBirth = dateOfBirthInput.val();
        const age = ageInput.val();

        if (name && age) {
            const response = await fetch('http://localhost:3000/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, dateOfBirth, age })
                body: JSON.stringify({ name, dateOfBirth, age })
            });


            if (response.ok) {
                await renderData();

                nameInput.val('');
                ageInput.val('');
                await renderData();

                nameInput.val('');
                ageInput.val('');
            }
        }
    });

    tableBody.on('click', async function (e) {
        if ($(e.target).hasClass('edit-button')) {
            const row = $(e.target).closest('tr');
            if ($(e.target).text() === 'Edit') {

    tableBody.on('click', async function (e) {
        if ($(e.target).hasClass('edit-button')) {
            const row = $(e.target).closest('tr');
            if ($(e.target).text() === 'Edit') {
                handleEditClick(row);
            } else if ($(e.target).text() === 'Save') {
            } else if ($(e.target).text() === 'Save') {
                handleSaveClick(row);
            }
        } else if ($(e.target).hasClass('delete-button')) {
            const id = $(e.target).data('id');
        } else if ($(e.target).hasClass('delete-button')) {
            const id = $(e.target).data('id');
            handleDeleteClick(id);
        }
    });

    const dateOfBirthInput = $('#dateOfBirth');
    const ageInput = $('#age');
    const dateOfBirthInput = $('#dateOfBirth');
    const ageInput = $('#age');

    dateOfBirthInput.on('change', () => {
        const dob = new Date(dateOfBirthInput.val());
    dateOfBirthInput.on('change', () => {
        const dob = new Date(dateOfBirthInput.val());
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
        ageInput.val(age);
        ageInput.val(age);
    });

    await renderData();
});