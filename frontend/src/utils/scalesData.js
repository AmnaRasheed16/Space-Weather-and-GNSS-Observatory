export const scaleData = {
    "scale-g": {
        title: "Geomagnetic Storms (G-Scale)",
        badge: "Observed: None (G0)",
        badgeClass: "none",
        cause: "Coronal Mass Ejections (CMEs) or High-Speed Solar Wind Streams",
        impact: "Severe Magnetospheric perturbations, triggering electron density bubbles",
        threat: "Loss of signal lock, phase scintillation, ranging errors up to 10 meters",
        delay: "2.5m - 8.2m average range drift",
        meterValue: "45%",
        meterClass: "bg-yellow",
        meterText: "GNSS Threat Indicator: Moderate",
        desc: "Geomagnetic storms disrupt Earth's magnetic envelope, causing massive currents in the upper atmosphere. These perturbations trigger local ionospheric scintillation, causing signal dispersion and tracking loss in receivers. Single-frequency GPS devices suffer severe ranging anomalies under storm conditions."
    },
    "scale-s": {
        title: "Solar Radiation Storms (S-Scale)",
        badge: "Observed: None (S0)",
        badgeClass: "none",
        cause: "Solar Proton Events (SPE) ejected during major solar flares",
        impact: "High-energy protons penetrate the ionosphere, increasing D-region ionization",
        threat: "Severe signal absorption in polar regions, inducing path loss, sat-to-ground errors",
        delay: "1.0m - 3.5m ranging anomalies",
        meterValue: "25%",
        meterClass: "bg-cyan",
        meterText: "GNSS Threat Indicator: Low",
        desc: "Solar radiation storms eject highly charged protons that flow along magnetic lines to the Earth's poles. They ionize the D-layer of the ionosphere, leading to Polar Cap Absorption (PCA) events. High-frequency polar aviation communications and trans-polar satellite links face severe signal degradation."
    },
    "scale-r": {
        title: "Radio Blackouts (R-Scale)",
        badge: "Observed: Minor (R1)",
        badgeClass: "minor",
        cause: "Sudden solar X-ray bursts ionizing the sunlit side of the Earth",
        impact: "Sudden Ionospheric Disturbances (SIDs) in the D-region absorption layer",
        threat: "HF radio blackout, signal attenuation, cycle slips on L1/L2 GNSS carrier frequencies",
        delay: "3.2m - 12.0m sudden range drift spikes",
        meterValue: "65%",
        meterClass: "bg-orange",
        meterText: "GNSS Threat Indicator: High",
        desc: "Radio blackouts occur when high-energy solar UV and X-ray radiation flares strike Earth's atmosphere, instantly ionizing the D-region. This triggers sudden, sharp increases in Total Electron Content (TEC), throwing off signal transit times and creating major range calibration errors in satellite tracking arrays."
    }
};
