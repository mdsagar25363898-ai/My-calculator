let currentValue = "0";
let expression = "";
let justCalculated = false;

const display = document.getElementById("display");
const historyDisplay = document.getElementById("history");
const historyList = document.getElementById("historyList");

function updateDisplay() {
    if (display) display.textContent = currentValue;
    if (historyDisplay) historyDisplay.textContent = expression;
}

function appendNumber(number) {
    if (justCalculated) {
        expression = "";
        currentValue = "0";
        justCalculated = false;
    }
    if (currentValue === "Error") currentValue = "0";
    if (currentValue === "0") currentValue = number;
    else currentValue += number;
    updateDisplay();
}

function appendDecimal() {
    if (justCalculated) {
        expression = "";
        currentValue = "0";
        justCalculated = false;
    }
    if (!currentValue.includes(".")) currentValue += ".";
    updateDisplay();
}

function appendParenthesis(type) {
    if (justCalculated) {
        expression = "";
        currentValue = "0";
        justCalculated = false;
    }
    if (type === "(") {
        if (currentValue !== "0") expression += currentValue + "*";
        expression += "(";
        currentValue = "0";
    } else {
        if (currentValue !== "0") expression += currentValue;
        expression += ")";
        currentValue = "0";
    }
    updateDisplay();
}

function chooseOperator(operator) {
    if (currentValue === "Error") return;

    if (justCalculated) {
        expression = currentValue;
        justCalculated = false;
    } else if (currentValue !== "0") {
        expression += currentValue;
    }

    if (operator === "×") operator = "*";
    if (operator === "÷") operator = "/";

    if (/[+\-*/^]$/.test(expression)) expression = expression.slice(0, -1);
    expression += operator;
    currentValue = "0";
    updateDisplay();
}

function clearDisplay() {
    currentValue = "0";
    expression = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    if (justCalculated) {
        currentValue = "0";
        expression = "";
        justCalculated = false;
        updateDisplay();
        return;
    }
    if (currentValue !== "0") {
        currentValue = currentValue.slice(0, -1);
        if (currentValue === "" || currentValue === "-") currentValue = "0";
    } else if (expression.length > 0) {
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

function percentage() {
    if (currentValue === "Error") return;
    const number = parseFloat(currentValue);
    if (!isNaN(number)) currentValue = String(number / 100);
    updateDisplay();
}

function square() {
    if (currentValue === "Error") return;
    const number = parseFloat(currentValue);
    if (isNaN(number)) return;
    currentValue = formatResult(number * number);
    justCalculated = true;
    updateDisplay();
}

function squareRoot() {
    if (currentValue === "Error") return;
    const number = parseFloat(currentValue);
    if (isNaN(number)) return;
    if (number < 0) {
        currentValue = "Error";
        expression = "√(" + number + ")";
    } else {
        currentValue = formatResult(Math.sqrt(number));
        justCalculated = true;
    }
    updateDisplay();
}

function toggleSign() {
    if (currentValue === "0" || currentValue === "Error") return;
    currentValue = currentValue.startsWith("-") ? currentValue.substring(1) : "-" + currentValue;
    updateDisplay();
}

function appendConstant(constant) {
    if (justCalculated) {
        expression = "";
        currentValue = "0";
        justCalculated = false;
    }
    if (constant === "pi") {
        if (currentValue === "0") currentValue = String(Math.PI);
        else {
            expression += currentValue + "*";
            currentValue = String(Math.PI);
        }
    }
    updateDisplay();
}

function scientificFunction(func) {
    if (currentValue === "Error") return;
    const number = parseFloat(currentValue);
    if (isNaN(number)) return;

    let result;
    if (func === "sin") result = Math.sin(number * Math.PI / 180);
    else if (func === "cos") result = Math.cos(number * Math.PI / 180);
    else if (func === "tan") result = Math.tan(number * Math.PI / 180);
    else if (func === "log") {
        if (number <= 0) { currentValue = "Error"; updateDisplay(); return; }
        result = Math.log10(number);
    } else if (func === "ln") {
        if (number <= 0) { currentValue = "Error"; updateDisplay(); return; }
        result = Math.log(number);
    }

    if (result !== undefined) {
        currentValue = formatResult(result);
        justCalculated = true;
        updateDisplay();
    }
}

function factorial() {
    if (currentValue === "Error") return;
    const number = Number(currentValue);
    if (!Number.isInteger(number) || number < 0 || number > 170) {
        currentValue = "Error";
        updateDisplay();
        return;
    }
    let result = 1;
    for (let i = 2; i <= number; i++) result *= i;
    currentValue = formatResult(result);
    justCalculated = true;
    updateDisplay();
}

function calculate() {
    if (currentValue === "Error") return;
    let fullExpression = expression + currentValue;
    if (!fullExpression.trim()) return;

    try {
        let jsExpression = fullExpression;
        jsExpression = jsExpression.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
        jsExpression = jsExpression.replace(/(\d+(?:\.\d+)?)\^/g, "$1**");

        const result = Function('"use strict"; return (' + jsExpression + ')')();
        if (typeof result !== "number" || !isFinite(result)) throw new Error();

        const formatted = formatResult(result);
        addHistory(fullExpression, formatted);
        currentValue = formatted;
        expression = fullExpression + " =";
        justCalculated = true;
        updateDisplay();
    } catch (error) {
        currentValue = "Error";
        expression = fullExpression;
        updateDisplay();
    }
}

function formatResult(number) {
    if (!isFinite(number)) return "Error";
    number = Number(parseFloat(number.toFixed(12)));
    return String(number);
}

function addHistory(exp, result) {
    if (!historyList) return;
    const item = document.createElement("div");
    item.className = "history-item";
    item.textContent = exp + " = " + result;
    historyList.prepend(item);
    saveHistory();
}

function saveHistory() {
    if (!historyList) return;
    const items = [];
    historyList.querySelectorAll(".history-item").forEach(item => items.push(item.textContent));
    localStorage.setItem("calculatorHistory", JSON.stringify(items));
}

function loadHistory() {
    if (!historyList) return;
    const savedHistory = localStorage.getItem("calculatorHistory");
    if (!savedHistory) return;
    try {
        JSON.parse(savedHistory).forEach(text => {
            const item = document.createElement("div");
            item.className = "history-item";
            item.textContent = text;
            historyList.appendChild(item);
        });
    } catch (error) {
        localStorage.removeItem("calculatorHistory");
    }
}

function clearHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    localStorage.removeItem("calculatorHistory");
}

function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem("calculatorTheme", document.body.classList.contains("light") ? "light" : "dark");
}

function loadTheme() {
    if (localStorage.getItem("calculatorTheme") === "light") document.body.classList.add("light");
}

loadTheme();
loadHistory();
updateDisplay();
