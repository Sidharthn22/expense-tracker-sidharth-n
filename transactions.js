/* =========================
   DATA
========================= */

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let filteredTransactions = [];



/* =========================
   ELEMENTS
========================= */

const tableBody =
    document.getElementById("transactionTableBody");

const mobileList =
    document.getElementById("mobileTransactionList");

const emptyState =
    document.getElementById("emptyState");

const transactionCount =
    document.getElementById("transactionCount");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const searchInput =
    document.getElementById("searchInput");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");

const editModal =
    document.getElementById("editModal");

const editForm =
    document.getElementById("editForm");



/* =========================
   INITIAL LOAD
========================= */

updateCategoryFilter();

displayTransactions();



/* =========================
   CATEGORY FILTER
========================= */

function updateCategoryFilter() {

    const currentValue =
        categoryFilter.value;

    const categories = [];

    transactions.forEach(function (transaction) {

        const category =
            transaction.category.trim();

        if (
            category &&
            !categories.some(function (item) {

                return item.toLowerCase() ===
                    category.toLowerCase();

            })
        ) {

            categories.push(category);

        }

    });


    categories.sort();


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);

    });


    const exists =
        categories.some(function (category) {

            return category.toLowerCase() ===
                currentValue.toLowerCase();

        });


    if (exists) {

        categoryFilter.value =
            currentValue;

    } else {

        categoryFilter.value = "all";

    }

}



/* =========================
   DISPLAY
========================= */

function displayTransactions() {

    let result =
        [...transactions];


    /* Type */

    if (typeFilter.value !== "all") {

        result =
            result.filter(function (transaction) {

                return transaction.type ===
                    typeFilter.value;

            });

    }


    /* Category */

    if (categoryFilter.value !== "all") {

        result =
            result.filter(function (transaction) {

                return transaction.category
                    .trim()
                    .toLowerCase() ===
                    categoryFilter.value
                        .trim()
                        .toLowerCase();

            });

    }


    /* Search */

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(function (transaction) {

                return (
                    transaction.description
                        .toLowerCase()
                        .includes(search)
                    ||
                    transaction.category
                        .toLowerCase()
                        .includes(search)
                );

            });

    }


    /* From date */

    if (fromDate.value) {

        result =
            result.filter(function (transaction) {

                return transaction.date >=
                    fromDate.value;

            });

    }


    /* To date */

    if (toDate.value) {

        result =
            result.filter(function (transaction) {

                return transaction.date <=
                    toDate.value;

            });

    }


    /* Newest first */

    result.sort(function (a, b) {

        return new Date(b.date) -
            new Date(a.date);

    });


    filteredTransactions = result;


    renderTransactions();

}



/* =========================
   RENDER
========================= */

function renderTransactions() {

    tableBody.innerHTML = "";

    mobileList.innerHTML = "";


    if (
        filteredTransactions.length === 0
    ) {

        emptyState.style.display =
            "block";

        transactionCount.textContent =
            "0 transactions";

        return;

    }


    emptyState.style.display =
        "none";


    const count =
        filteredTransactions.length;


    transactionCount.textContent =
        count +
        (count === 1
            ? " transaction"
            : " transactions");


    filteredTransactions.forEach(
        function (transaction, index) {

            renderDesktopTransaction(
                transaction,
                index
            );

            renderMobileTransaction(
                transaction
            );

        }
    );

}



/* =========================
   DESKTOP ROW
========================= */

function renderDesktopTransaction(
    transaction,
    index
) {

    const row =
        document.createElement("tr");


    const sign =
        transaction.type === "income"
            ? "+"
            : "-";


    const typeLabel =
        transaction.type === "income"
            ? "Income"
            : "Expense";


    row.innerHTML = `

        <td>
            ${index + 1}
        </td>

        <td class="description-cell">
            ${escapeHTML(
                transaction.description
            )}
        </td>

        <td>
            <span class="category-badge">
                ${escapeHTML(
                    transaction.category
                )}
            </span>
        </td>

        <td>
            <span class="type-badge ${transaction.type}">
                ${typeLabel}
            </span>
        </td>

        <td>
            ${formatDate(transaction.date)}
        </td>

        <td>
            <span class="amount ${transaction.type}">
                ${sign}
                ₹${Number(
                    transaction.amount
                ).toLocaleString("en-IN")}
            </span>
        </td>

        <td>

            <div class="actions">

                <button
                    class="edit-button"
                    onclick="openEditModal(${transaction.id})"
                    title="Edit"
                >
                    ✎
                </button>

                <button
                    class="delete-button"
                    onclick="deleteTransaction(${transaction.id})"
                    title="Delete"
                >
                    🗑
                </button>

            </div>

        </td>

    `;


    tableBody.appendChild(row);

}



/* =========================
   MOBILE CARD
========================= */

function renderMobileTransaction(
    transaction
) {

    const item =
        document.createElement("div");


    item.className =
        "mobile-transaction";


    const sign =
        transaction.type === "income"
            ? "+"
            : "-";


    item.innerHTML = `

        <div class="mobile-top">

            <span class="mobile-description">
                ${escapeHTML(
                    transaction.description
                )}
            </span>

            <span class="mobile-amount ${transaction.type}">
                ${sign}
                ₹${Number(
                    transaction.amount
                ).toLocaleString("en-IN")}
            </span>

        </div>


        <div class="mobile-bottom">

            <div class="mobile-meta">

                <span class="category-badge">
                    ${escapeHTML(
                        transaction.category
                    )}
                </span>

                <span class="mobile-date">
                    ${formatDate(
                        transaction.date
                    )}
                </span>

            </div>


            <div class="mobile-actions">

                <button
                    class="edit-button"
                    onclick="openEditModal(${transaction.id})"
                >
                    ✎
                </button>

                <button
                    class="delete-button"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    🗑
                </button>

            </div>

        </div>

    `;


    mobileList.appendChild(item);

}



/* =========================
   EDIT
========================= */

function openEditModal(id) {

    const transaction =
        transactions.find(function (item) {

            return item.id === id;

        });


    if (!transaction) {

        return;

    }


    document.getElementById("editId").value =
        transaction.id;

    document.getElementById("editType").value =
        transaction.type;

    document.getElementById("editAmount").value =
        transaction.amount;

    document.getElementById("editCategory").value =
        transaction.category;

    document.getElementById("editDate").value =
        transaction.date;

    document.getElementById("editDescription").value =
        transaction.description;


    editModal.classList.add("show");

}



/* =========================
   CLOSE MODAL
========================= */

function closeEditModal() {

    editModal.classList.remove("show");

}


document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeEditModal
    );


document
    .getElementById("cancelModal")
    .addEventListener(
        "click",
        closeEditModal
    );


editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === editModal
        ) {

            closeEditModal();

        }

    }
);



/* =========================
   UPDATE TRANSACTION
========================= */

editForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            Number(
                document.getElementById(
                    "editId"
                ).value
            );


        const amount =
            Number(
                document.getElementById(
                    "editAmount"
                ).value
            );


        const category =
            document.getElementById(
                "editCategory"
            ).value.trim();


        const date =
            document.getElementById(
                "editDate"
            ).value;


        const description =
            document.getElementById(
                "editDescription"
            ).value.trim();


        if (
            amount <= 0 ||
            !category ||
            !date ||
            !description
        ) {

            alert(
                "Please fill in all fields correctly."
            );

            return;

        }


        transactions =
            transactions.map(
                function (transaction) {

                    if (
                        transaction.id !== id
                    ) {

                        return transaction;

                    }


                    return {

                        id: id,

                        type:
                            document.getElementById(
                                "editType"
                            ).value,

                        amount: amount,

                        category: category,

                        date: date,

                        description: description

                    };

                }
            );


        saveTransactions();

        updateCategoryFilter();

        displayTransactions();

        closeEditModal();

    }
);



/* =========================
   DELETE
========================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(function (item) {

            return item.id === id;

        });


    if (!transaction) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${transaction.description}"?`
        );


    if (!confirmed) {

        return;

    }


    transactions =
        transactions.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveTransactions();

    updateCategoryFilter();

    displayTransactions();

}



/* =========================
   FILTER BUTTONS
========================= */

document
    .getElementById("applyFilter")
    .addEventListener(
        "click",
        displayTransactions
    );


document
    .getElementById("resetFilter")
    .addEventListener(
        "click",
        function () {

            typeFilter.value = "all";

            categoryFilter.value = "all";

            searchInput.value = "";

            fromDate.value = "";

            toDate.value = "";

            displayTransactions();

        }
    );


searchInput.addEventListener(
    "input",
    displayTransactions
);



/* =========================
   LOCAL STORAGE
========================= */

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}



/* =========================
   DATE
========================= */

function formatDate(date) {

    const dateObject =
        new Date(
            date + "T00:00:00"
        );


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}



/* =========================
   HTML SAFETY
========================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}



/* =========================
   MOBILE MENU
========================= */

const menuButton =
    document.getElementById(
        "menuButton"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const overlay =
    document.getElementById(
        "overlay"
    );


function toggleMenu() {

    sidebar.classList.toggle(
        "open"
    );

    overlay.classList.toggle(
        "show"
    );

}


menuButton.addEventListener(
    "click",
    toggleMenu
);


overlay.addEventListener(
    "click",
    toggleMenu
);