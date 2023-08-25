$(document).ready(async function () {
    const form = $('#dataForm');
    const tableBody = $('#dataTable tbody');
    const districtInput = $('#district');
    const stateInput = $('#state');
    const countryInput = $('#country');
    const districtDropdown = $('#districtDropdown');

    async function fetchDistricts(query) {
        const response = await fetch(`http://localhost:3000/districts`);
        const districts = await response.json();
        console.log(districts);
        return districts;
    }

    async function renderDistrictSuggestions(query) {
        const filteredDistricts = await fetchDistricts(query);

        districtDropdown.empty();

        if (filteredDistricts.length > 0) {
            filteredDistricts.forEach(district => {
                const option = $('<div>').addClass('district-option').text(district.name);
                districtDropdown.append(option);
            });
            districtDropdown.show();
        } else {
            districtDropdown.hide();
        }
    }

    districtInput.on('input', function () {
        const query = $(this).val();
        renderDistrictSuggestions(query);
        stateInput.val('');
        countryInput.val('');
    });

    districtDropdown.on('click', '.district-option', async function () {
        const selectedDistrict = $(this).text();
        districtInput.val(selectedDistrict);
        districtDropdown.hide();
    
        // Fetch and populate state and country based on selected district
        const response = await fetch(`http://localhost:3000/districts`);
        const districtData = await response.json();
        console.log(districtData) // This line logs the fetched data to the console
    
        if (districtData && Array.isArray(districtData)) {
            const selectedDistrictInfo = districtData.find(district => district.name === selectedDistrict);
            console.log(selectedDistrictInfo)
    
            if (selectedDistrictInfo) {
                stateInput.val(selectedDistrictInfo.state);
                countryInput.val(selectedDistrictInfo.country);
            }
        }
    });
    

    async function fetchData() {
        const response = await fetch('http://localhost:3000/data');
        const data = await response.json();
        const formattedData = data.map(entry => ({
            ...entry,
            dateOfBirth: new Date(entry.dateOfBirth)
        }));
        return formattedData;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    async function renderData(filter = '') {
        const data = await fetchData();
        data.sort((a, b) => a.age - b.age);

        const filteredData = data.filter(entry => 
            entry.name.toLowerCase().includes(filter.toLowerCase()) ||
            formatDate(entry.dateOfBirth).includes(filter) ||
            entry.age.toString().includes(filter) ||
            entry.district.toLowerCase().includes(filter.toLowerCase()) ||
            entry.state.toLowerCase().includes(filter.toLowerCase()) ||
            entry.country.toLowerCase().includes(filter.toLowerCase()) // Add this line for state filtering
        );
    

        const rowElements = filteredData.map(entry => {
            const dobFormatted = formatDate(entry.dateOfBirth);

            return `
                <tr>
                    <td>${entry.name}</td>
                    <td>${dobFormatted}</td>
                    <td>${entry.district}</td>
                    <td>${entry.state}</td>
                    <td>${entry.country}</td>
                    <td style="text-align: center">${entry.age}</td>
                    <td class="action-buttons">
                        <button class="edit-button" data-id="${entry.id}">Edit</button>
                        <button class="delete-button" data-id="${entry.id}">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableBody.html(rowElements.join(''));
    }

    $('#searchBar').on('input', function () {
        const searchInput = $(this).val();
        renderData(searchInput);
    });

    async function updateData(id, name, dateOfBirth, age, district, state, country) {
        const response = await fetch(`http://localhost:3000/data/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, dateOfBirth, age, district, state, country })
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
        const districtCell = $(row).find('td:nth-child(3)');
        const stateCell = $(row).find('td:nth-child(4)');
        const countryCell = $(row).find('td:nth-child(5)');
        const ageCell = $(row).find('td:nth-child(6)');
        const actionCell = $(row).find('.action-buttons');

        const name = nameCell.text();
        const dob = dobCell.text();
        const district = districtCell.text();
        const state = stateCell.text();
        const country = countryCell.text();
        const age = ageCell.text();

        nameCell.html(`<input type="text" class="edit-name" value="${name}" style="width: 180px;" />`);
        dobCell.html(`<input type="date" class="edit-dob" value="${dob}" style="width: 98%; border-radius: 6px; height: 41px; border: 1px solid #c5c5c5;" />`);
        districtCell.html(`<input type="text" class="edit-district" value="${district}" style="width: 80px;" />`);
        stateCell.html(`<input type="text" class="edit-state" value="${state}" style="width: 80px;" />`);
        countryCell.html(`<input type="text" class="edit-country" value="${country}" style="width: 80px;" />`);
        ageCell.html(`<span class="edit-age">${age}</span>`);
        $(row).find('.edit-button').text('Save');

        actionCell.addClass('expanded-cell');
    }

    async function handleSaveClick(row) {
        const id = $(row).find('.edit-button').data('id');
        const newName = $(row).find('.edit-name').val();
        const newDob = $(row).find('.edit-dob').val();
        const newDistrict = $(row).find('.edit-district').val();
        const newState = $(row).find('.edit-state').val();
        const newCountry = $(row).find('.edit-country').val();
        const newAge = $(row).find('.edit-age').text(); // Get the age from the existing text

        const success = await updateData(id, newName, newDob, newAge, newDistrict, newState, newCountry);

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
        }
    }

    form.on('submit', async function (e) {
        console.log('Form submitted'); // Check if the form submission is triggered

        const nameInput = $('#name');
        const dateOfBirthInput = $('#dateOfBirth');
        const ageInput = $('#age');
        const districtInput = $('#district');
        const stateInput = $('#state');
        const countryInput = $('#country');

        const name = nameInput.val();
        const dateOfBirth = dateOfBirthInput.val();
        const age = ageInput.val();
        const district = districtInput.val();
        const state = stateInput.val();
        const country = countryInput.val();

        console.log('Name:', name);
        console.log('Date of Birth:', dateOfBirth);
        console.log('Age:', age);
        console.log('District:', district);
        console.log('State:', state);
        console.log('Country:', country);

        if (name && age) {
            const response = await fetch('http://localhost:3000/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, dateOfBirth, age, district, state, country })
            });

            if (response.ok) {
                await renderData();

                nameInput.val('');
                ageInput.val('');
                districtInput.val('');
                stateInput.val('');
                countryInput.val('');
            }
        }
    });
    tableBody.on('click', async function (e) {
        if ($(e.target).hasClass('edit-button')) {
            const row = $(e.target).closest('tr');
            if ($(e.target).text() === 'Edit') {
                handleEditClick(row);
            } else if ($(e.target).text() === 'Save') {
                handleSaveClick(row);
            }
        } else if ($(e.target).hasClass('delete-button')) {
            const id = $(e.target).data('id');
            handleDeleteClick(id);
        }
    });

    const dateOfBirthInput = $('#dateOfBirth');
    const ageInput = $('#age');

    dateOfBirthInput.on('change', () => {
        const dob = new Date(dateOfBirthInput.val());
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0);
        ageInput.val(age);
    });

    await renderData();
});
