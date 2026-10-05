let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const transactionForm = document.getElementById("transactionForm");

let incomeExpenseChart = null;

let savingsChart = null;

let cashFlowChart = null;


/* =========================
   INITIAL LOAD
========================= */

updateCategoryFilter();
displayTransactions();
updateDashboard();
updateAnalytics();


/* =========================
   ADD TRANSACTION
========================= */

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value.trim();
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value.trim();


    /* Validation */

    if (amount <= 0) {

        alert("Please enter a valid amount.");
        return;

    }


    if (!category || !date || !description) {

        alert("Please fill in all fields.");
        return;

    }


    const transaction = {

        id: Date.now(),
        type: type,
        amount: amount,
        category: category,
        date: date,
        description: description

    };


    transactions.push(transaction);

    saveTransactions();

    updateCategoryFilter();
    displayTransactions();
    updateDashboard();
    updateAnalytics();

    transactionForm.reset();

});


/* =========================
   DISPLAY TRANSACTIONS
========================= */

function displayTransactions() {

    const transactionList =
        document.getElementById("transactionList");

    const typeFilter =
        document.getElementById("typeFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");


    transactionList.innerHTML = "";

    let filteredTransactions = [...transactions];


    /* ----- TYPE FILTER ----- */

    if (typeFilter && typeFilter.value !== "all") {

        filteredTransactions =
            filteredTransactions.filter(function (transaction) {

                return transaction.type === typeFilter.value;

            });

    }


    /* ----- CATEGORY FILTER ----- */

    if (categoryFilter && categoryFilter.value !== "all") {

        filteredTransactions =
            filteredTransactions.filter(function (transaction) {

                return transaction.category.trim().toLowerCase() ===
                    categoryFilter.value.trim().toLowerCase();

            });

    }


    /* ----- SORT BY DATE ----- */

    filteredTransactions.sort(function (a, b) {

        return new Date(b.date) - new Date(a.date);

    });
    filteredTransactions = filteredTransactions.slice(0, 5);


    /* ----- EMPTY RESULT ----- */

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            '<p class="empty-message">No transactions found.</p>';

        return;

    }


    /* ----- DISPLAY ----- */

    filteredTransactions.forEach(function (transaction) {

        const transactionElement =
            document.createElement("div");

        transactionElement.classList.add("transaction");


        transactionElement.innerHTML = `

            <div class="transaction-info">

                <h3>
                    ${escapeHTML(transaction.category)}
                </h3>

                <p>
                    ${escapeHTML(transaction.description)}
                </p>

                <small>
                    ${formatDate(transaction.date)}
                </small>

            </div>


            <div class="transaction-right">

                <strong class="${transaction.type}">

                    ${transaction.type === "income" ? "+" : "-"}

                    ₹${Number(transaction.amount).toLocaleString("en-IN")}

                </strong>


                <button
                    class="delete-button"
                    onclick="deleteTransaction(${transaction.id})">

                    Delete

                </button>

            </div>

        `;


        transactionList.appendChild(transactionElement);

    });

}


/* =========================
   DELETE TRANSACTION
========================= */

function deleteTransaction(id) {

    const transaction =
        transactions.find(function (transaction) {

            return transaction.id === id;

        });


    if (!transaction) {
        return;
    }


    const confirmed = confirm(
        `Delete this ${transaction.category} transaction?`
    );


    if (!confirmed) {
        return;
    }


    transactions =
        transactions.filter(function (transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    updateCategoryFilter();
    displayTransactions();
    updateDashboard();
    updateAnalytics();

}


/* =========================
   UPDATE DASHBOARD
========================= */

function updateDashboard() {

    let totalIncome = 0;
    let totalExpenses = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += Number(transaction.amount);

        }


        if (transaction.type === "expense") {

            totalExpenses += Number(transaction.amount);

        }

    });


    const balance =
        totalIncome - totalExpenses;


    document.getElementById("totalIncome").textContent =
        "₹" + totalIncome.toLocaleString("en-IN");


    document.getElementById("totalExpenses").textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");


    document.getElementById("currentBalance").textContent =
        "₹" + balance.toLocaleString("en-IN");

}


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
   CATEGORY FILTER
========================= */

function updateCategoryFilter() {

    const categoryFilter =
        document.getElementById("categoryFilter");


    if (!categoryFilter) {
        return;
    }


    const currentCategory =
        categoryFilter.value;


    const categoryMap = new Map();


    transactions.forEach(function (transaction) {

        const category =
            transaction.category.trim();

        const categoryKey =
            category.toLowerCase();


        if (!categoryMap.has(categoryKey)) {

            categoryMap.set(categoryKey, category);

        }

    });


    const categories =
        Array.from(categoryMap.values()).sort();


    categoryFilter.innerHTML =
        '<option value="all">All Categories</option>';


    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });


    const categoryExists =
        categories.some(function (category) {

            return category.toLowerCase() ===
                currentCategory.toLowerCase();

        });


    if (categoryExists) {

        const matchingCategory =
            categories.find(function (category) {

                return category.toLowerCase() ===
                    currentCategory.toLowerCase();

            });

        categoryFilter.value =
            matchingCategory;

    } else {

        categoryFilter.value = "all";

    }

}


/* =========================
   FILTER EVENTS
========================= */

document
    .getElementById("typeFilter")
    .addEventListener("change", function () {

        displayTransactions();

    });


document
    .getElementById("categoryFilter")
    .addEventListener("change", function () {

        displayTransactions();

    });


/* =========================
   DATE FORMAT
========================= */

function formatDate(date) {

    const dateObject =
        new Date(date + "T00:00:00");


    return dateObject.toLocaleDateString("en-IN", {

        day: "2-digit",
        month: "short",
        year: "numeric"

    });

}


/* =========================
   BASIC HTML SAFETY
========================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* =========================
   ANALYTICS
========================= */

function updateAnalytics() {

    const monthlyIncomeElement =
        document.getElementById("monthlyIncome");

    const monthlyExpensesElement =
        document.getElementById("monthlyExpenses");

    const monthlyBalanceElement =
        document.getElementById("monthlyBalance");

    const categoryChart =
        document.getElementById("categoryChart");


    if (!monthlyIncomeElement ||
        !monthlyExpensesElement ||
        !monthlyBalanceElement) {

        return;

    }


    /* =========================
       CURRENT MONTH SUMMARY
    ========================= */

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    let monthlyIncome = 0;
    let monthlyExpenses = 0;


    const categoryExpenses = {};


    transactions.forEach(function (transaction) {

        const transactionDate =
            new Date(transaction.date + "T00:00:00");


        const sameMonth =
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear;


        if (!sameMonth) {
            return;
        }


        if (transaction.type === "income") {

            monthlyIncome +=
                Number(transaction.amount);

        }


        if (transaction.type === "expense") {

            monthlyExpenses +=
                Number(transaction.amount);


            const category =
                transaction.category.trim();


            if (!categoryExpenses[category]) {

                categoryExpenses[category] = 0;

            }


            categoryExpenses[category] +=
                Number(transaction.amount);

        }

    });


    const monthlyBalance =
        monthlyIncome - monthlyExpenses;


    monthlyIncomeElement.textContent =
        "₹" + monthlyIncome.toLocaleString("en-IN");


    monthlyExpensesElement.textContent =
        "₹" + monthlyExpenses.toLocaleString("en-IN");


    monthlyBalanceElement.textContent =
        "₹" + monthlyBalance.toLocaleString("en-IN");


    /* =========================
       EXPENSE BY CATEGORY
    ========================= */

    categoryChart.innerHTML = "";


    const categories =
        Object.entries(categoryExpenses)
            .sort(function (a, b) {

                return b[1] - a[1];

            });


    if (categories.length === 0) {

        categoryChart.innerHTML =
            '<p class="chart-empty">No expense data available for this month.</p>';

    } else {

        const highestExpense =
            Math.max(...categories.map(function (item) {

                return item[1];

            }));


        categories.forEach(function (item) {

            const category = item[0];
            const amount = item[1];


            const percentage =
                (amount / highestExpense) * 100;


            const row =
                document.createElement("div");

            row.classList.add("chart-row");


            row.innerHTML = `

                <div class="chart-header">

                    <span class="chart-category">
                        ${escapeHTML(category)}
                    </span>

                    <span class="chart-amount">
                        ₹${amount.toLocaleString("en-IN")}
                    </span>

                </div>


                <div class="chart-bar-container">

                    <div
                        class="chart-bar"
                        style="width: ${percentage}%">
                    </div>

                </div>

            `;


            categoryChart.appendChild(row);

        });

    }


    /* =========================
       MONTHLY GRAPHS
    ========================= */

    updateMonthlyCharts();

}


/* =========================
   PREPARE MONTHLY DATA
========================= */

function getMonthlyData() {

    const monthlyData = {};


    transactions.forEach(function (transaction) {

        const date =
            new Date(transaction.date + "T00:00:00");


        const year =
            date.getFullYear();

        const month =
            date.getMonth();


        const key =
            year + "-" +
            String(month + 1).padStart(2, "0");


        if (!monthlyData[key]) {

            monthlyData[key] = {

                label: date.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short",
                        year: "numeric"
                    }
                ),

                income: 0,

                expenses: 0

            };

        }


        if (transaction.type === "income") {

            monthlyData[key].income +=
                Number(transaction.amount);

        }


        if (transaction.type === "expense") {

            monthlyData[key].expenses +=
                Number(transaction.amount);

        }

    });


    const sortedMonths =
        Object.keys(monthlyData).sort();


    return sortedMonths.map(function (key) {

        return monthlyData[key];

    });

}/* =========================
   MONTHLY LINE CHARTS
========================= */

function updateMonthlyCharts() {

    const incomeExpenseCanvas =
        document.getElementById("incomeExpenseChart");

    const savingsCanvas =
        document.getElementById("savingsChart");

    const cashFlowCanvas =
        document.getElementById("cashFlowChart");


    if (
        !incomeExpenseCanvas ||
        !savingsCanvas ||
        typeof Chart === "undefined"
    ) {

        return;

    }


    const monthlyData =
        getMonthlyData();


    const labels =
        monthlyData.map(function (item) {

            return item.label;

        });


    const incomeData =
        monthlyData.map(function (item) {

            return item.income;

        });


    const expenseData =
        monthlyData.map(function (item) {

            return item.expenses;

        });


    const savingsData =
        monthlyData.map(function (item) {

            return item.income - item.expenses;

        });


    /* =========================
       INCOME VS EXPENSES
    ========================= */

    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(incomeExpenseCanvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Income",

                        data: incomeData,

                        borderColor: "#16a34a",

                        backgroundColor:
                            "rgba(22, 163, 74, 0.08)",

                        borderWidth: 3,

                        tension: 0.35,

                        fill: false,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    },


                    {
                        label: "Expenses",

                        data: expenseData,

                        borderColor: "#ef4444",

                        backgroundColor:
                            "rgba(239, 68, 68, 0.08)",

                        borderWidth: 3,

                        tension: 0.35,

                        fill: false,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },


                plugins: {

                    legend: {

                        display: true,

                        position: "top"

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback: function (value) {

                                return "₹" +
                                    Number(value)
                                        .toLocaleString("en-IN");

                            }

                        }

                    }

                }

            }

        });


    /* =========================
       MONEY SAVED
    ========================= */

    if (savingsChart) {

        savingsChart.destroy();

    }


    savingsChart =
        new Chart(savingsCanvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label: "Money Saved",

                        data: savingsData,

                        borderColor: "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.08)",

                        borderWidth: 3,

                        tension: 0.35,

                        fill: true,

                        pointRadius: 4,

                        pointHoverRadius: 6

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true,

                        position: "top"

                    }

                },


                scales: {

                    y: {

                        beginAtZero: false,

                        ticks: {

                            callback: function (value) {

                                return "₹" +
                                    Number(value)
                                        .toLocaleString("en-IN");

                            }

                        }

                    }

                }

            }

        });


    /* =========================
       CASH FLOW
    ========================= */

    if (cashFlowCanvas) {

        const cashFlowMonth =
            document.getElementById("cashFlowMonth");


        if (cashFlowMonth) {

            /* =========================
               GET AVAILABLE MONTHS
            ========================= */

            const months = [];


            transactions.forEach(function (transaction) {

                const date =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );


                const monthKey =
                    date.getFullYear() +
                    "-" +
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0");


                if (!months.includes(monthKey)) {

                    months.push(monthKey);

                }

            });


            months.sort();


            /* =========================
               REMEMBER SELECTED MONTH
            ========================= */

            const previousMonth =
                cashFlowMonth.value;


            /* =========================
               FILL MONTH DROPDOWN
            ========================= */

            cashFlowMonth.innerHTML = "";


            months.forEach(function (month) {

                const option =
                    document.createElement("option");


                const parts =
                    month.split("-");


                const year =
                    Number(parts[0]);


                const monthNumber =
                    Number(parts[1]);


                const date =
                    new Date(
                        year,
                        monthNumber - 1,
                        1
                    );


                option.value =
                    month;


                option.textContent =
                    date.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            year: "numeric"
                        }
                    );


                cashFlowMonth.appendChild(option);

            });


            /* =========================
               KEEP SELECTED MONTH
            ========================= */

            if (
                previousMonth &&
                months.includes(previousMonth)
            ) {

                cashFlowMonth.value =
                    previousMonth;

            } else {

                const now =
                    new Date();


                const currentMonthKey =
                    now.getFullYear() +
                    "-" +
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0");


                if (
                    months.includes(
                        currentMonthKey
                    )
                ) {

                    cashFlowMonth.value =
                        currentMonthKey;

                } else {

                    cashFlowMonth.value =
                        months[
                            months.length - 1
                        ];

                }

            }


            /* =========================
               GET SELECTED MONTH
            ========================= */

            const selectedMonth =
                cashFlowMonth.value;


            const selectedParts =
                selectedMonth.split("-");


            const selectedYear =
                Number(
                    selectedParts[0]
                );


            const selectedMonthNumber =
                Number(
                    selectedParts[1]
                ) - 1;


            let selectedIncome = 0;

            let selectedExpenses = 0;


            transactions.forEach(function (transaction) {

                const transactionDate =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );


                if (
                    transactionDate.getFullYear() ===
                        selectedYear &&

                    transactionDate.getMonth() ===
                        selectedMonthNumber
                ) {

                    if (
                        transaction.type ===
                        "income"
                    ) {

                        selectedIncome +=
                            Number(
                                transaction.amount
                            );

                    }


                    if (
                        transaction.type ===
                        "expense"
                    ) {

                        selectedExpenses +=
                            Number(
                                transaction.amount
                            );

                    }

                }

            });


            /* =========================
               CALCULATE BALANCE
            ========================= */

            const selectedBalance =
                Math.max(
                    selectedIncome -
                    selectedExpenses,
                    0
                );


            /* =========================
               CASH FLOW DONUT
            ========================= */

            if (cashFlowChart) {

                cashFlowChart.destroy();

            }


            cashFlowChart =
                new Chart(
                    cashFlowCanvas,
                    {

                        type: "doughnut",


                        data: {

                            labels: [

                                "Balance",

                                "Spent"

                            ],


                            datasets: [

                                {

                                    data: [

                                        selectedBalance,

                                        selectedExpenses

                                    ],


                                    backgroundColor: [

                                        "#2563eb",

                                        "#ef4444"

                                    ],


                                    borderWidth: 0

                                }

                            ]

                        },


                        options: {

                            responsive: true,

                            maintainAspectRatio: false,

                            cutout: "65%",


                            plugins: {

                                legend: {

                                    display: true,

                                    position: "bottom"

                                },


                                tooltip: {

                                    callbacks: {

                                        label:
                                            function (context) {

                                            return (
                                                context.label +
                                                ": ₹" +
                                                Number(
                                                    context.raw
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                            );

                                        }

                                    }

                                }

                            }

                        }

                    }
                );


            /* =========================
               CHANGE MONTH
            ========================= */

            cashFlowMonth.onchange =
                function () {

                    updateMonthlyCharts();

                };

        }

    }

}