/**
 * tabs.js
 * -------
 * Tab switching logic, external HTML loading,
 * guideline table rendering, and side-panel toggle.
 */

import { state } from "./state.js";
import { setLegend } from "./mapPoints.js";
import { applyFilters, populateFilters } from "./filters.js";

// ── Tab content loader ────────────────────────────────────────────────────────

export async function loadTabContent(tabId) {
    if (tabId === state.currentActiveTab) return;

    const container = document.getElementById("tabContentContainer");
    if (!container) return;

    container.innerHTML = "<p>Loading content…</p>";

    try {
        const response = await fetch(`tabs/${tabId}.html`);
        if (!response.ok) throw new Error(`Failed to load ${tabId}.html`);

        container.innerHTML = await response.text();
        state.currentActiveTab = tabId;

        if ((tabId === "wq" || tabId === "data") && state.raw.length > 0) {
            populateFilters();
        }

        if (tabId === "wq") renderGuidelineTable();
    } catch (error) {
        container.innerHTML = `<p style="color: red;">Error loading tab content: ${error.message}</p>`;
        state.currentActiveTab = null;
    }

    document.getElementById("contentWrapper").scrollTop = 0;
    setTimeout(() => state.map.invalidateSize(), 150);
}

// ── Tab setup ─────────────────────────────────────────────────────────────────

export function setupTabs() {
    const tabs = document.querySelectorAll(".tab");

    tabs.forEach((tab) => {
        const tabId = tab.dataset.target;

        tab.addEventListener("click", () => {
            state.saveExtent      = state.map.getBounds();
            state.suppressAutoZoom = true;

            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");

            state.currentColorMode = tabId === "wq" ? "WQ" : "SITE_TYPE";
            setLegend(state.currentColorMode);

            loadTabContent(tabId);
            applyFilters();

            setTimeout(() => {
                if (state.saveExtent) state.map.fitBounds(state.saveExtent, { animate: false });
                state.suppressAutoZoom = false;
            }, 50);
        });
    });

    const initialTab = document.querySelector(".tab.active");
    if (initialTab) loadTabContent(initialTab.dataset.target);
}

// ── Side panel toggle ─────────────────────────────────────────────────────────

export function setupSidePanelToggle() {
    const sidePanel    = document.getElementById("sidePanel");
    const toggleButton = document.getElementById("toggleButton");

    toggleButton.onclick = () => {
        sidePanel.classList.toggle("hidden");
        toggleButton.classList.toggle("closed");
        toggleButton.style.left = sidePanel.classList.contains("hidden") ? "20px" : "460px";
        setTimeout(() => state.map.invalidateSize(), 300);
    };
}

// ── Guideline table ───────────────────────────────────────────────────────────

export async function renderGuidelineTable() {
    const container = document.getElementById("guidelineTableContainer");
    if (!container) return;

    try {
        const res  = await fetch("tabs/guidelines.json");
        const json = await res.json();

        let sortState = { column: null, direction: 1 };

        function renderTableRows() {
            const rows = json.map((item) => `
                <tr>
                    <td>${item.Parameter}</td>
                    <td>${item.Guideline}</td>
                </tr>`).join("");
            container.querySelector("tbody").innerHTML = rows;
        }

        function sortAndRender(column) {
            sortState.direction = sortState.column === column ? sortState.direction * -1 : 1;
            sortState.column    = column;

            json.sort((a, b) => {
                const va = a[column] || "", vb = b[column] || "";
                if (va < vb) return -1 * sortState.direction;
                if (va > vb) return  1 * sortState.direction;
                return 0;
            });

            renderTableRows();

            container.querySelectorAll("th").forEach((h) =>
                h.classList.remove("sorted-asc", "sorted-desc")
            );
            const active = container.querySelector(`th[data-col="${column}"]`);
            if (active) active.classList.add(sortState.direction === 1 ? "sorted-asc" : "sorted-desc");
        }

        container.innerHTML = `
            <table class="guideline-table sortable-table">
                <thead>
                    <tr>
                        <th data-col="Parameter">Parameter</th>
                        <th data-col="Guideline">Guideline</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>`;

        container.querySelectorAll("th").forEach((th) => {
            th.style.cursor = "pointer";
            th.addEventListener("click", () => sortAndRender(th.dataset.col));
        });

        renderTableRows();
    } catch (e) {
        console.error("Failed to load guideline JSON:", e);
        container.innerHTML = `<p style="color:red;">Error loading guideline values.</p>`;
    }
}
