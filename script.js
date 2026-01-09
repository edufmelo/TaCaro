// Configurações API
const API_URL = 'https://economia.awesomeapi.com.br/last/EUR-BRL,BRL-EUR';

let rateEuroToReal = 0; 
let rateRealToEuro = 0; 

// --- ELEMENTOS DO DOM ---
const rateInfo = document.getElementById('rateInfo');

// Elementos da Parte 1 (Euro -> Real)
const divEuroReal = document.getElementById("euro-real");
const euroInput = document.getElementById('euroInput');
const feeInput = document.getElementById('feeInput');
const realOutput = document.getElementById('realOutput');

// Elementos da Parte 2 (Real -> Euro)
const divRealEuro = document.getElementById("real-euro");
const realInput = document.getElementById('realInput');
const feeInput2 = document.getElementById('feeInput_2');
const euroOutput = document.getElementById('euroOutput');

const euroWarning = document.getElementById('euroWarning');
const realWarning = document.getElementById('realWarning');

// --- 1. BUSCAR A API ---
async function fetchRate() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // 1. Cotação Euro para Real (High/Ask)
        rateEuroToReal = parseFloat(data.EURBRL.ask);
        
        // 2. Cotação Real para Euro (High/Ask)
        rateRealToEuro = parseFloat(data.BRLEUR.ask);
        
        const date = new Date();
        const timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        rateInfo.innerHTML = `1 € = R$ ${rateEuroToReal.toFixed(4)} | R$ 1 = ${rateRealToEuro.toFixed(4)} € <br> Atualizado às ${timeString}`;
        rateInfo.classList.remove('loading');

        // Recalcular tudo
        calculateEuroToReal();
        calculateRealToEuro();
    } catch (error) {
        rateInfo.innerHTML = "Erro ao buscar cotação.";
        rateInfo.style.color = "red";
        console.error("Erro API:", error);
    }
}

// --- 2. LÓGICA DE CÁLCULO ---
function calculateEuroToReal() {
    let euroValue = parseFloat(euroInput.value);
    let feeValue = parseFloat(feeInput.value);

    if (euroValue < 0) {
        euroWarning.style.display = 'block';
        euroWarning.innerText = "O valor não pode ser negativo.";
        realOutput.innerText = "R$ 0,00"; // Zera o resultado
        return; 
    } else {
        euroWarning.style.display = 'none';
    }

    if (isNaN(euroValue) || euroValue === 0) {
        realOutput.innerText = "R$ 0,00";
        return;
    }
    
    // Desconta a taxa (ex: 1.1% vira fator 0.989)
    let discountFactor = 1 - (feeValue / 100);
    
    // Multiplica pela cotação EUR->BRL
    let finalRate = rateEuroToReal * discountFactor;
    
    let result = euroValue * finalRate;
    realOutput.innerText = result.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calculateRealToEuro() {
    let realValue = parseFloat(realInput.value);
    let feeValue = parseFloat(feeInput2.value);

    if (realValue < 0) {
        realWarning.style.display = 'block';
        realWarning.innerText = "O valor não pode ser negativo.";
        euroOutput.innerText = "0,00 €"; // Zera o resultado
        return; 
    } else {
        realWarning.style.display = 'none';
    }

    if (isNaN(realValue) || realValue === 0) {
        euroOutput.innerText = "0,00 €";
        return;
    }

    // Desconta a taxa 
    let discountFactor = 1 - (feeValue / 100);
    let finalRate = rateRealToEuro * discountFactor;
    let result = realValue * finalRate;

    euroOutput.innerText = result.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

// --- 3. ALTERNAR TELAS (TOGGLE) ---
function pressButton() {
    if (divEuroReal.style.display !== "none") {
        divEuroReal.style.display = "none";
        divRealEuro.style.display = "block";
    } else {
        divRealEuro.style.display = "none";
        divEuroReal.style.display = "block";
    }
}

// --- 4. EVENTOS ---
euroInput.addEventListener('input', calculateEuroToReal);
feeInput.addEventListener('input', calculateEuroToReal);

realInput.addEventListener('input', calculateRealToEuro);
feeInput2.addEventListener('input', calculateRealToEuro);

// Iniciar
fetchRate();
setInterval(fetchRate, 30000);