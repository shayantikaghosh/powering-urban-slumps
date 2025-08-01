const dailyWasteKgInput = document.getElementById('dailyWasteKg');
const rooftopAreaSqMInput = document.getElementById('rooftopAreaSqM');
const numHouseholdsInput = document.getElementById('numHouseholds');
const wteEnergyValue = document.getElementById('wteEnergyValue');
const solarEnergyValue = document.getElementById('solarEnergyValue');
const totalEnergyValue = document.getElementById('totalEnergyValue');
const estimatedDemandValue = document.getElementById('estimatedDemandValue');
const wasteDivertedValue = document.getElementById('wasteDivertedValue');
const methaneReducedValue = document.getElementById('methaneReducedValue');
const unmetDemandValue = document.getElementById('unmetDemandValue');
const systemSufficiencyValue = document.getElementById('systemSufficiencyValue');
const systemSufficiencyDescription = document.getElementById('systemSufficiencyDescription');
const unmetDemandCard = document.getElementById('unmetDemandCard');
const systemSufficiencyCard = document.getElementById('systemSufficiencyCard');
const energyBarChartCanvas = document.getElementById('energyBarChart');
const ctx = energyBarChartCanvas.getContext('2d');
const ORGANIC_WASTE_PERCENTAGE = 0.6;
const BIOGAS_YIELD_PER_TON = 55;
const ELECTRICITY_PER_CUBIC_METER_BIOGAS = 2;
const SOLAR_INSOLATION_HOURS = 4.5;
const SOLAR_PANEL_EFFICIENCY = 0.20;
const AVG_HOUSEHOLD_DEMAND_KWH_DAY = 7;
const METHANE_EMISSION_FACTOR_KG_PER_TON_WASTE = 100;
function calculateSimulation() {
    const dailyWasteKg = parseFloat(dailyWasteKgInput.value);
    const rooftopAreaSqM = parseFloat(rooftopAreaSqMInput.value);
    const numHouseholds = parseFloat(numHouseholdsInput.value);
    const organicWasteTons = (dailyWasteKg * ORGANIC_WASTE_PERCENTAGE) / 1000;
    const biogasProducedCubicM = organicWasteTons * BIOGAS_YIELD_PER_TON;
    const wteEnergy = biogasProducedCubicM * ELECTRICITY_PER_CUBIC_METER_BIOGAS;
    const solarEnergy = rooftopAreaSqM * SOLAR_PANEL_EFFICIENCY * SOLAR_INSOLATION_HOURS * 1;
    const totalGenerated = wteEnergy + solarEnergy;
    const demand = numHouseholds * AVG_HOUSEHOLD_DEMAND_KWH_DAY;
    const unmet = Math.max(0, demand - totalGenerated);
    const wasteDiverted = dailyWasteKg * ORGANIC_WASTE_PERCENTAGE;
    const methaneReduced = organicWasteTons * METHANE_EMISSION_FACTOR_KG_PER_TON_WASTE;
    wteEnergyValue.textContent = `${wteEnergy.toFixed(2)} kWh`;
    solarEnergyValue.textContent = `${solarEnergy.toFixed(2)} kWh`;
    totalEnergyValue.textContent = `${totalGenerated.toFixed(2)} kWh`;
    estimatedDemandValue.textContent = `${demand.toFixed(2)} kWh`;
    wasteDivertedValue.textContent = `${wasteDiverted.toFixed(2)} kg`;
    methaneReducedValue.textContent = `${methaneReduced.toFixed(2)} kg`;
    unmetDemandValue.textContent = `${unmet.toFixed(2)} kWh`;
    if (unmet > 0) {
        unmetDemandCard.classList.remove('bg-green-200', 'border-green-500');
        unmetDemandCard.classList.add('bg-red-200', 'border-red-500');
    } else {
        unmetDemandCard.classList.remove('bg-red-200', 'border-red-500');
        unmetDemandCard.classList.add('bg-green-200', 'border-green-500');
    }
    if (totalGenerated >= demand) {
        systemSufficiencyValue.textContent = "Sufficient";
        systemSufficiencyDescription.textContent = "The system can meet or exceed daily demand based on current parameters.";
        systemSufficiencyCard.classList.remove('bg-red-200', 'border-red-500');
        systemSufficiencyCard.classList.add('bg-green-200', 'border-green-500');
    } else {
        systemSufficiencyValue.textContent = "Insufficient";
        systemSufficiencyDescription.textContent = "The system cannot fully meet daily demand. Consider increasing waste input, solar area, or optimizing demand.";
        systemSufficiencyCard.classList.remove('bg-green-200', 'border-green-500');
        systemSufficiencyCard.classList.add('bg-red-200', 'border-red-500');
    }
    drawEnergyBarChart(wteEnergy, solarEnergy, totalGenerated, demand);
}
function drawEnergyBarChart(wteEnergy, solarEnergy, totalEnergy, estimatedDemand) {
    const width = energyBarChartCanvas.width;
    const height = energyBarChartCanvas.height;
    ctx.clearRect(0, 0, width, height);
    const data = [
        { label: 'WtE Energy', value: wteEnergy, color: '#4CAF50' },
        { label: 'Solar Energy', value: solarEnergy, color: '#FFC107' },
        { label: 'Total Generated', value: totalEnergy, color: '#2196F3' },
        { label: 'Estimated Demand', value: estimatedDemand, color: '#9C27B0' },
    ];
    const maxValue = Math.max(...data.map(item => item.value)) * 1.1;
    const barWidth = (width - 100) / data.length;
    const startX = 50;
    const startY = height - 50;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, 20);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(width - 20, startY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
        const yValue = (maxValue / numYLabels) * i;
        const yPos = startY - (yValue / maxValue) * (startY - 20);
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(yValue.toFixed(0) + ' kWh', startX - 5, yPos + 4);
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(startX, yPos);
            ctx.lineTo(width - 20, yPos);
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (startY - 20);
        const xPos = startX + index * barWidth + (barWidth / 4);
        const yPos = startY - barHeight;
        ctx.fillStyle = item.color;
        ctx.fillRect(xPos, yPos, barWidth / 2, barHeight);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toFixed(0), xPos + barWidth / 4, yPos - 5);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, xPos + barWidth / 4, startY + 20);
    });
}
async function getGeminiInsight() {
    const promptInput = document.getElementById('geminiPrompt');
    const responseContainer = document.getElementById('geminiResponse');
    const getInsightBtn = document.getElementById('getInsightBtn');
    getInsightBtn.disabled = true;
    getInsightBtn.textContent = "Generating...";
    responseContainer.innerHTML = '<p class="text-center text-gray-500">Loading...</p>';
    const dailyWasteKg = parseFloat(document.getElementById('dailyWasteKg').value);
    const rooftopAreaSqM = parseFloat(document.getElementById('rooftopAreaSqM').value);
    const numHouseholds = parseFloat(document.getElementById('numHouseholds').value);
    const ORGANIC_WASTE_PERCENTAGE = 0.6;
    const BIOGAS_YIELD_PER_TON = 55;
    const ELECTRICITY_PER_CUBIC_METER_BIOGAS = 2;
    const SOLAR_PANEL_EFFICIENCY = 0.20;
    const SOLAR_INSOLATION_HOURS = 4.5;
    const AVG_HOUSEHOLD_DEMAND_KWH_DAY = 7;
    const METHANE_EMISSION_FACTOR_KG_PER_TON_WASTE = 100;
    const organicWasteTons = (dailyWasteKg * ORGANIC_WASTE_PERCENTAGE) / 1000;
    const wteEnergy = organicWasteTons * BIOGAS_YIELD_PER_TON * ELECTRICITY_PER_CUBIC_METER_BIOGAS;
    const solarEnergy = rooftopAreaSqM * SOLAR_PANEL_EFFICIENCY * SOLAR_INSOLATION_HOURS;
    const totalGenerated = wteEnergy + solarEnergy;
    const demand = numHouseholds * AVG_HOUSEHOLD_DEMAND_KWH_DAY;
    const unmet = Math.max(0, demand - totalGenerated);
    const wasteDiverted = dailyWasteKg * ORGANIC_WASTE_PERCENTAGE;
    const methaneReduced = organicWasteTons * METHANE_EMISSION_FACTOR_KG_PER_TON_WASTE;
    const userPrompt = promptInput.value;
    const fullPrompt = `You are a helpful AI assistant for an Urban Synergy Hub simulator. The current simulation parameters are:
    - Daily Waste: ${dailyWasteKg} kg
    - Rooftop Area: ${rooftopAreaSqM} sq M
    - Number of Households: ${numHouseholds}
    
    The simulation results are:
    - Energy from Waste-to-Energy: ${wteEnergy.toFixed(2)} kWh
    - Energy from Solar PV: ${solarEnergy.toFixed(2)} kWh
    - Total Energy Generated: ${totalGenerated.toFixed(2)} kWh
    - Estimated Community Demand: ${demand.toFixed(2)} kWh
    - Unmet Demand: ${unmet.toFixed(2)} kWh
    - Waste Diverted: ${wasteDiverted.toFixed(2)} kg
    - Methane Emissions Reduced: ${methaneReduced.toFixed(2)} kg
    
    Based on this data, please provide a concise and clear answer to the following question:
    '${userPrompt}'`;
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: fullPrompt }] });
    const payload = { contents: chatHistory };
    let retries = 3;
    let delay = 1000;
    while(retries > 0){
        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                if (response.status === 429) {
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                    retries--;
                    continue;
                } else {
                    throw new Error(`API call failed with status: ${response.status}`);
                }
            }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                responseContainer.innerHTML = `<p>${text}</p>`;
            } else {
                responseContainer.innerHTML = '<p class="text-red-500">Could not retrieve a valid response from the API.</p>';
            }
            break;
        } catch (error) {
            console.error('Error fetching from Gemini API:', error);
            responseContainer.innerHTML = `<p class="text-red-500">An error occurred: ${error.message}</p>`;
            break;
        }
    }
    getInsightBtn.disabled = false;
    getInsightBtn.textContent = "Get Insight";
}
dailyWasteKgInput.addEventListener('input', calculateSimulation);
rooftopAreaSqMInput.addEventListener('input', calculateSimulation);
numHouseholdsInput.addEventListener('input', calculateSimulation);
document.getElementById('getInsightBtn').addEventListener('click', getGeminiInsight);
window.onload = calculateSimulation;