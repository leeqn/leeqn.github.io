const datesText = document.getElementById("datesText");

const savedDates = localStorage.getItem("marathonDates");
if (savedDates) {
    datesText.textContent = savedDates;
}

function saveDates() {
    const currentText = datesText.textContent.trim();
    localStorage.setItem("marathonDates", currentText);
}

datesText.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        saveDates();
        datesText.blur();
    }
});

datesText.addEventListener("blur", () => {
    saveDates();
});