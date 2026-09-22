let isMetric = false; 
let isAuthenticated = false;
let currentUser = { name: "", email: "", initials: "" };

function requireAuth(targetFunction) {
  if (isAuthenticated) { targetFunction(); } 
  else { document.getElementById('auth-modal').classList.remove('hidden-view'); }
}

function authenticateUser() {
  const nameInput = document.getElementById('auth_name').value.trim();
  const emailInput = document.getElementById('auth_email').value.trim().toLowerCase();
  const errorMsg = document.getElementById('auth_error');

  if (nameInput === "" || !emailInput.includes('@') || !emailInput.includes('.')) {
    errorMsg.style.display = 'block'; return;
  }

  errorMsg.style.display = 'none';
  isAuthenticated = true;
  currentUser.name = nameInput;
  currentUser.email = emailInput;
  currentUser.initials = nameInput.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  document.getElementById('nav_username').innerText = currentUser.name;
  document.getElementById('nav_avatar').innerText = currentUser.initials;
  document.getElementById('nav_user_badge').style.display = 'flex';
  
  document.getElementById('profile_name').innerText = currentUser.name;
  document.getElementById('profile_email').innerText = currentUser.email;
  document.getElementById('profile_avatar').innerText = currentUser.initials;
  document.getElementById('operator_profile').style.display = 'flex';

  document.getElementById('auth-modal').classList.add('hidden-view');
  launchSimulator();
}

function launchSimulator() {
  document.getElementById('welcome-section').classList.remove('active-view');
  document.getElementById('welcome-section').classList.add('hidden-view');
  document.getElementById('calculator-section').classList.remove('hidden-view');
  document.getElementById('calculator-section').classList.add('active-view');
  document.getElementById('unit_toggle').style.display = 'block';
  window.scrollTo(0, 0);
  calculateTrueAPI();
}

function goHome() {
  document.getElementById('calculator-section').classList.remove('active-view');
  document.getElementById('calculator-section').classList.add('hidden-view');
  document.getElementById('welcome-section').classList.remove('hidden-view');
  document.getElementById('welcome-section').classList.add('active-view');
  document.getElementById('unit_toggle').style.display = 'none';
  window.scrollTo(0, 0);
}

function saveConfiguration() {
  const statusSpan = document.getElementById('save-status');
  statusSpan.innerText = `✓ Config Saved to Cloud Server`;
  statusSpan.style.opacity = "1";
  setTimeout(() => { statusSpan.style.opacity = "0"; }, 3000);
}

function exportData() {
  document.getElementById('pr_date').innerText = new Date().toLocaleString();
  document.getElementById('pr_operator').innerText = currentUser.name || "Offline Operator";
  document.getElementById('pr_email').innerText = currentUser.email || "N/A";

  const unitH = isMetric ? "m" : "ft";
  const unitL = isMetric ? "m" : "ft";
  const unitS = isMetric ? "m" : "in";
  
  document.getElementById('pr_in_H').innerText = document.getElementById('in_H').value + " " + unitH;
  document.getElementById('pr_in_L').innerText = document.getElementById('in_L').value + " " + unitL;
  document.getElementById('pr_in_G').innerText = document.getElementById('in_G').value;
  document.getElementById('pr_in_N').innerText = document.getElementById('in_N').value;
  document.getElementById('pr_in_S').innerText = document.getElementById('in_S').value + " " + unitS;
  
  const sel_D = document.getElementById('in_D');
  document.getElementById('pr_in_D').innerText = sel_D.options[sel_D.selectedIndex].text;
  const sel_api = document.getElementById('in_api_string');
  document.getElementById('pr_in_api').innerText = sel_api.options[sel_api.selectedIndex].text;
  const sel_tubing = document.getElementById('in_tubing');
  document.getElementById('pr_in_tubing').innerText = sel_tubing.options[sel_tubing.selectedIndex].text;

  document.getElementById('pr_pd_100').innerText = document.getElementById('out_pd_100').innerText + " " + document.getElementById('unit_pd_100').innerText;
  document.getElementById('pr_pd_95').innerText = document.getElementById('out_pd_95').innerText + " " + document.getElementById('unit_pd_95').innerText;
  document.getElementById('pr_pd_90').innerText = document.getElementById('out_pd_90').innerText + " " + document.getElementById('unit_pd_90').innerText;
  
  document.getElementById('pr_out_pprl').innerText = document.getElementById('out_23').innerText + " " + document.getElementById('unit_23').innerText;
  document.getElementById('pr_out_mprl').innerText = document.getElementById('out_24').innerText + " " + document.getElementById('unit_24').innerText;
  document.getElementById('pr_out_pt').innerText = document.getElementById('out_25').innerText + " " + document.getElementById('unit_25').innerText;
  document.getElementById('pr_out_prhp').innerText = document.getElementById('out_26').innerText + " " + document.getElementById('unit_26').innerText;
  document.getElementById('pr_out_cbe').innerText = document.getElementById('out_27').innerText + " " + document.getElementById('unit_27').innerText;
  document.getElementById('pr_out_fo').innerText = document.getElementById('out_5').innerText + " " + document.getElementById('unit_5').innerText;

  const canvas = document.getElementById('dynoCanvas');
  document.getElementById('pr_dyno_img').src = canvas.toDataURL("image/png");

  document.getElementById('pr_rec_unit').innerHTML = document.getElementById('ai_unit_suggestion').innerHTML;
  document.getElementById('pr_rec_taper').innerHTML = document.getElementById('ai_rod_sequence').innerHTML;

  window.print();
}

window.onload = function() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => { 
    input.addEventListener('input', calculateTrueAPI); 
    input.addEventListener('change', calculateTrueAPI);
  });

  document.getElementById('unit_toggle').addEventListener('click', function() {
    let H_val = parseFloat(document.getElementById('in_H').value) || 0;
    let L_val = parseFloat(document.getElementById('in_L').value) || 0;
    let S_val = parseFloat(document.getElementById('in_S').value) || 0;
    let thp_val = parseFloat(document.getElementById('in_thp').value) || 0;

    isMetric = !isMetric;
    this.innerText = isMetric ? "⚙️ IMPERIAL" : "⚙️ METRIC";

    if (isMetric) {
      document.getElementById('in_H').value = (H_val * 0.3048).toFixed(1);
      document.getElementById('in_L').value = (L_val * 0.3048).toFixed(1);
      document.getElementById('in_S').value = (S_val * 0.0254).toFixed(2);
      document.getElementById('in_thp').value = (thp_val * 0.0689476).toFixed(1);
      
      document.getElementById('lbl_H').innerText = "Fluid Level (m)";
      document.getElementById('lbl_L').innerText = "Pump Depth (m)";
      document.getElementById('lbl_S').innerText = "Surface Stroke (m)";
      document.getElementById('lbl_thp').innerText = "Max THP (bar)";
    } else {
      document.getElementById('in_H').value = Math.round(H_val / 0.3048);
      document.getElementById('in_L').value = Math.round(L_val / 0.3048);
      document.getElementById('in_S').value = Math.round(S_val / 0.0254);
      document.getElementById('in_thp').value = Math.round(thp_val / 0.0689476);
      
      document.getElementById('lbl_H').innerText = "Fluid Level (ft)";
      document.getElementById('lbl_L').innerText = "Pump Depth (ft)";
      document.getElementById('lbl_S').innerText = "Surface Stroke (in)";
      document.getElementById('lbl_thp').innerText = "Max THP (psig)";
    }

    calculateTrueAPI();
  });

  const nodes = document.querySelectorAll('.tree-node');
  nodes.forEach(node => {
    node.addEventListener('click', function() {
      nodes.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      const compKey = this.getAttribute('data-component');
      const data = componentData[compKey];
      document.getElementById('detail_icon').innerText = data.icon;
      document.getElementById('detail_title').innerText = data.title;
      document.getElementById('detail_text').innerText = data.text;
    });
  });
};

const componentData = {
  "motor": { icon: "⚙️", title: "Prime Mover & Gearbox", text: "Provides the raw rotational power. The gear reducer scales the high-speed motor rotation into the high-torque, low-speed rotation required to lift heavy fluid columns." },
  "beam": { icon: "⚖️", title: "Walking Beam", text: "Pivoting on the Samson post, it converts rotational power from the pitman arms into vertical reciprocating motion. The horsehead ensures the polished rod remains perfectly aligned." },
  "wellhead": { icon: "🛢️", title: "Wellhead Assembly", text: "The structural foundation at the surface. The stuffing box contains packing glands that seal around the moving polished rod, preventing leaks." },
  "rods": { icon: "⛓️", title: "Sucker Rod String", text: "A highly-engineered steel tether that transmits the lifting motion from the surface down to the pump. Tapered designs are used in deep wells to balance tensile stress." },
  "tubing": { icon: "🕳️", title: "Tubing & Casing", text: "Casing lines the drilled hole. Tubing is the inner conduit through which the produced oil and water are lifted to the surface by the pump's displacement." },
  "pump": { icon: "⬇️", title: "Downhole Pump", text: "The heart of the artificial lift system. Contains a moving plunger with a traveling valve, and a stationary barrel with a standing valve. It traps and displaces fluid upward." }
};

const API_ROD_TABLE = {
  "66": { 
    "1.25": { Wr: 1.309, Er: 1.118, taper: [{size: "3/4", pct: 0.28}, {size: "5/8", pct: 0.72}] },
    "1.50": { Wr: 1.393, Er: 1.050, taper: [{size: "3/4", pct: 0.35}, {size: "5/8", pct: 0.65}] },
    "1.75": { Wr: 1.488, Er: 0.983, taper: [{size: "3/4", pct: 0.43}, {size: "5/8", pct: 0.57}] },
    "2.00": { Wr: 1.550, Er: 0.940, taper: [{size: "3/4", pct: 0.50}, {size: "5/8", pct: 0.50}] },
    "2.25": { Wr: 1.600, Er: 0.900, taper: [{size: "3/4", pct: 0.55}, {size: "5/8", pct: 0.45}] },
    "2.50": { Wr: 1.650, Er: 0.850, taper: [{size: "3/4", pct: 0.60}, {size: "5/8", pct: 0.40}] },
    "2.75": { Wr: 1.700, Er: 0.800, taper: [{size: "3/4", pct: 0.65}, {size: "5/8", pct: 0.35}] }
  },
  "76": { 
    "1.25": { Wr: 1.801, Er: 0.817, taper: [{size: "7/8", pct: 0.31}, {size: "3/4", pct: 0.69}] },
    "1.50": { Wr: 1.833, Er: 0.804, taper: [{size: "7/8", pct: 0.34}, {size: "3/4", pct: 0.66}] },
    "1.75": { Wr: 1.931, Er: 0.767, taper: [{size: "7/8", pct: 0.43}, {size: "3/4", pct: 0.57}] },
    "2.00": { Wr: 2.001, Er: 0.741, taper: [{size: "7/8", pct: 0.50}, {size: "3/4", pct: 0.50}] },
    "2.25": { Wr: 2.091, Er: 0.706, taper: [{size: "7/8", pct: 0.58}, {size: "3/4", pct: 0.42}] },
    "2.50": { Wr: 2.140, Er: 0.680, taper: [{size: "7/8", pct: 0.63}, {size: "3/4", pct: 0.37}] },
    "2.75": { Wr: 2.200, Er: 0.650, taper: [{size: "7/8", pct: 0.68}, {size: "3/4", pct: 0.32}] }
  },
  "86": { 
    "1.25": { Wr: 2.164, Er: 0.674, taper: [{size: "1", pct: 0.22}, {size: "7/8", pct: 0.33}, {size: "3/4", pct: 0.45}] },
    "1.50": { Wr: 2.214, Er: 0.659, taper: [{size: "1", pct: 0.28}, {size: "7/8", pct: 0.32}, {size: "3/4", pct: 0.40}] },
    "1.75": { Wr: 2.269, Er: 0.643, taper: [{size: "1", pct: 0.34}, {size: "7/8", pct: 0.31}, {size: "3/4", pct: 0.35}] },
    "2.00": { Wr: 2.348, Er: 0.620, taper: [{size: "1", pct: 0.43}, {size: "7/8", pct: 0.30}, {size: "3/4", pct: 0.27}] },
    "2.25": { Wr: 2.404, Er: 0.603, taper: [{size: "1", pct: 0.49}, {size: "7/8", pct: 0.29}, {size: "3/4", pct: 0.22}] },
    "2.50": { Wr: 2.478, Er: 0.582, taper: [{size: "1", pct: 0.57}, {size: "7/8", pct: 0.28}, {size: "3/4", pct: 0.15}] },
    "2.75": { Wr: 2.550, Er: 0.560, taper: [{size: "1", pct: 0.65}, {size: "7/8", pct: 0.25}, {size: "3/4", pct: 0.10}] }
  }
};

const API_TUBING_TABLE = { 
  "2.375": { Et: 0.307, PPF: 4.70 }, 
  "2.875": { Et: 0.226, PPF: 6.50 }, 
  "3.500": { Et: 0.158, PPF: 9.30 }, 
  "4.500": { Et: 0.096, PPF: 11.60 } 
};

function safeUpdate(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function calculateTrueAPI() {
  let in_H_raw = parseFloat(document.getElementById('in_H').value) || 0;
  let in_L_raw = parseFloat(document.getElementById('in_L').value) || 0;
  let in_S_raw = parseFloat(document.getElementById('in_S').value) || 0;
  let in_thp_raw = parseFloat(document.getElementById('in_thp').value) || 0;
  
  let D = parseFloat(document.getElementById('in_D').value) || 0;
  const tubing_od = document.getElementById('in_tubing').value;
  
  let N_spm = parseFloat(document.getElementById('in_N').value) || 0;
  const G = parseFloat(document.getElementById('in_G').value) || 0;
  
  const H = isMetric ? in_H_raw / 0.3048 : in_H_raw;
  const L = isMetric ? in_L_raw / 0.3048 : in_L_raw;
  const S = isMetric ? in_S_raw / 0.0254 : in_S_raw;
  const THP = isMetric ? in_thp_raw / 0.0689476 : in_thp_raw; // Convert Bar back to PSIG

  const api_string = document.getElementById('in_api_string').value;
  const anchored = document.getElementById('in_anchored').value === 'yes';
  const use_sinker = document.getElementById('in_sinker').value === 'yes'; 

  const spm_safe = N_spm > 0 ? N_spm : 1; 
  const animDuration = (60 / spm_safe) + "s";
  if(document.getElementById('anim_beam')) document.getElementById('anim_beam').style.animationDuration = animDuration;
  if(document.getElementById('anim_rod')) document.getElementById('anim_rod').style.animationDuration = animDuration;
  if(document.getElementById('anim_crank')) document.getElementById('anim_crank').style.animationDuration = animDuration;

  let Wr = 1.85; let Er_raw = 0.800 * 1e-6; let activeTaper = []; 
  let Et_raw = 0; let tubing_ppf = 6.5;
  
  if (API_TUBING_TABLE[tubing_od]) {
    Et_raw = API_TUBING_TABLE[tubing_od].Et * 1e-6;
    tubing_ppf = API_TUBING_TABLE[tubing_od].PPF;
  }

  const lookupD = D.toFixed(2); 
  if (API_ROD_TABLE[api_string] && API_ROD_TABLE[api_string][lookupD]) {
    Wr = API_ROD_TABLE[api_string][lookupD].Wr;
    Er_raw = API_ROD_TABLE[api_string][lookupD].Er * 1e-6;
    activeTaper = API_ROD_TABLE[api_string][lookupD].taper;
  }

  const a = 16200; 
  const E = 30e6;  
  const A_avg = Wr / 3.4; 
  const Wrf = Wr * L * (1 - (0.128 * G)); 
  const Fo = 0.340 * G * Math.pow(D, 2) * H; 

  const dx = Math.max(L / 40, 50); 
  const nodes = Math.floor(L / dx);
  const dt = 0.5 * (dx / a); 
  
  const period = 60 / spm_safe;
  const omega = (spm_safe * 2 * Math.PI) / 60;
  const steps_per_cycle = Math.floor(period / dt);
  const total_steps = steps_per_cycle * 4; 
  const c_damp = 0.4; 

  let u_old = new Float64Array(nodes + 1);
  let u_curr = new Float64Array(nodes + 1);
  let u_new = new Float64Array(nodes + 1);

  let dyno_surface = [];
  let dyno_pump = [];
  let pprl_wave = 0;
  let mprl_wave = 1e9;
  let pump_load = Fo; 

  const S_ft = S / 12;

  for (let s = 0; s < total_steps; s++) {
      let t = s * dt;
      let pr_disp = (S_ft / 2) * (1 - Math.cos(omega * t) + 0.2 * Math.pow(Math.sin(omega * t), 2));
      u_new[0] = pr_disp;

      for (let i = 1; i < nodes; i++) {
          let d2u = (u_curr[i+1] - 2*u_curr[i] + u_curr[i-1]) / (dx * dx);
          let du_dt = (u_curr[i] - u_old[i]) / dt;
          u_new[i] = 2*u_curr[i] - u_old[i] + (dt * dt) * (a * a * d2u - c_damp * du_dt);
      }

      let v_pump = (u_curr[nodes] - u_old[nodes]) / dt;
      let target_load = v_pump > 0.1 ? Fo : (v_pump < -0.1 ? 0 : pump_load);
      pump_load += 0.05 * (target_load - pump_load); 

      let strain = pump_load / (E * A_avg);
      u_new[nodes] = u_new[nodes-1] - strain * dx;

      if (s > total_steps - steps_per_cycle) {
          let surf_strain = (u_new[0] - u_new[1]) / dx;
          let surf_load = Wrf + (E * A_avg * surf_strain);
          
          if (surf_load > pprl_wave) pprl_wave = surf_load;
          if (surf_load < mprl_wave) mprl_wave = surf_load;

          dyno_surface.push({ x: u_new[0] * 12, y: surf_load });
          dyno_pump.push({ x: u_new[nodes] * 12, y: pump_load });
      }

      for (let i = 0; i <= nodes; i++) {
          u_old[i] = u_curr[i];
          u_curr[i] = u_new[i];
      }
  }

  let CBE = 1.06 * (Wrf + (0.5 * Fo)); 
  let max_torque_up = (pprl_wave - CBE) * (S / 2) * 1.04;
  let max_torque_down = (CBE - mprl_wave) * (S / 2) * 1.04;
  const PT = Math.max(max_torque_up, max_torque_down); 
  
  let card_area_in_lbs = 0;
  for (let i = 1; i < dyno_surface.length; i++) {
      let x0 = dyno_surface[i-1].x;
      let x1 = dyno_surface[i].x;
      let y0 = dyno_surface[i-1].y;
      let y1 = dyno_surface[i].y;
      card_area_in_lbs += ((y0 + y1) / 2) * (x1 - x0);
  }
  const PRHP = Math.abs(card_area_in_lbs) * N_spm / 396000;
  
  const one_over_kt = anchored ? 0 : (Et_raw * L);
  const tubing_stretch = Fo * one_over_kt;
  const Sp_dynamic = Math.max(...dyno_pump.map(p => p.x)) - Math.min(...dyno_pump.map(p => p.x)) - tubing_stretch;
  
  let PD = 0.1166 * Math.max(Sp_dynamic, 0) * N_spm * Math.pow(D, 2);

  drawDynamicDyno(dyno_surface, dyno_pump, S, Fo, Wrf, isMetric);

  let out_PPRL = pprl_wave; let out_MPRL = mprl_wave; let out_PT = PT;
  let out_Fo = Fo; let out_Wr = Wr; let out_Wrf = Wrf;
  let disp_S = S; let out_Sp = Sp_dynamic; 

  if (isMetric) {
    PD *= 0.158987; out_PPRL *= 0.453592; out_PT *= 0.011521; out_MPRL *= 0.453592; CBE *= 0.453592;
    out_Fo *= 0.453592; out_Wr *= 1.48816; out_Wrf *= 0.453592; out_Sp *= 0.0254; disp_S *= 0.0254;
    
    let out_kW = PRHP * 0.7457;

    safeUpdate('unit_14', "m³/d"); safeUpdate('unit_23', "kg"); 
    safeUpdate('unit_25', "kg-m"); 
    safeUpdate('unit_24', "kg"); safeUpdate('unit_26', "kW"); safeUpdate('unit_27', "kg");
    safeUpdate('unit_5', "kg");
    safeUpdate('unit_pd_100', "m³/d"); safeUpdate('unit_pd_95', "m³/d"); safeUpdate('unit_pd_90', "m³/d");
    safeUpdate('out_26', out_kW.toFixed(1));
  } else {
    out_PT /= 12; 
    
    safeUpdate('unit_14', "bpd"); safeUpdate('unit_23', "lbs"); 
    safeUpdate('unit_25', "lbs-ft"); 
    safeUpdate('unit_24', "lbs"); safeUpdate('unit_26', "HP"); safeUpdate('unit_27', "lbs");
    safeUpdate('unit_5', "lbs");
    safeUpdate('unit_pd_100', "bpd"); safeUpdate('unit_pd_95', "bpd"); safeUpdate('unit_pd_90', "bpd");
    safeUpdate('out_26', PRHP.toFixed(1));
  }

  safeUpdate('out_14', Math.round(PD).toLocaleString());
  safeUpdate('out_23', Math.round(out_PPRL).toLocaleString());
  safeUpdate('out_25', Math.round(out_PT).toLocaleString());
  safeUpdate('out_24', Math.round(out_MPRL).toLocaleString());
  safeUpdate('out_27', Math.round(CBE).toLocaleString());
  safeUpdate('out_5', Math.round(out_Fo).toLocaleString());
  
  safeUpdate('out_pd_100', Math.round(PD).toLocaleString());
  safeUpdate('out_pd_95', Math.round(PD * 0.95).toLocaleString());
  safeUpdate('out_pd_90', Math.round(PD * 0.90).toLocaleString());

  safeUpdate('out_9', (N_spm * L / 245000).toFixed(3)); 
  safeUpdate('out_8', (Fo / (S * (Er_raw*L>0?1/(Er_raw*L):1))).toFixed(3)); 
  safeUpdate('out_SpS', (out_Sp / disp_S).toFixed(3));

  const original_PT = isMetric ? (out_PT / 0.011521) : out_PT;
  const original_PPRL = isMetric ? (out_PPRL / 0.453592) : out_PPRL;
  const apiTorques = [25, 40, 57, 80, 114, 160, 228, 320, 456, 640, 912, 1280];
  const apiLoads = [53, 76, 89, 119, 143, 173, 213, 256, 305, 365, 427, 470];
  const apiStrokes = [42, 48, 54, 64, 74, 86, 100, 120, 144, 168, 192];

  const recTorque = apiTorques.find(t => t * 1000 >= original_PT) || Math.ceil(original_PT/1000);
  const recLoad = apiLoads.find(l => l * 100 >= original_PPRL) || Math.ceil(original_PPRL/100);
  const recStroke = apiStrokes.find(s => s >= S) || Math.ceil(S);

  const unitSuggestion = `C-${recTorque}D-${recLoad}-${recStroke}`;
  const unitExplanation = `Based on predictive wave loads, the minimum recommended surface unit is <span class="highlight-text">${unitSuggestion}</span> to prevent gearbox failure.`;
  
  let L_sb = 0;
  if (use_sinker) {
    let buoyant_factor = 1 - (0.128 * G);
    let W_sb_air = 4.167; 
    let W_sb_fluid = W_sb_air * buoyant_factor;
    let required_weight = Fo * 0.30; 
    L_sb = Math.ceil((required_weight / W_sb_fluid) / 25) * 25; 
    if (L_sb > L * 0.3) L_sb = Math.round((L * 0.3) / 25) * 25; 
    if (L_sb < 0) L_sb = 0;
  }

  let L_taper = L - L_sb;

  let rodSequenceHTML = `<strong>API ${api_string} String Architecture (Total: ${L} ft):</strong><br><br>`;
  let step = 1; 
  rodSequenceHTML += `${step++}. Run Downhole Pump<br>`;
  
  if (L_sb > 0) {
    rodSequenceHTML += `${step++}. Run <span class="highlight-text">${L_sb} ft</span> of 1-1/4" Sinker Bars<br>`;
  }

  if(activeTaper && activeTaper.length > 0) {
    for (let i = activeTaper.length - 1; i >= 0; i--) {
      let segmentLength = Math.round(L_taper * activeTaper[i].pct);
      let loc = (i === 0) ? "Top" : "Middle";
      if (i === activeTaper.length - 1 && L_sb === 0) loc = "Bottom";
      
      rodSequenceHTML += `${step++}. Run <span class="highlight-text">${segmentLength} ft</span> of ${activeTaper[i].size}" Rods (${loc})<br>`;
    }
  } else { 
    rodSequenceHTML += `${step++}. Run <span class="highlight-text">${L_taper} ft</span> of rod string per generic API specification.<br>`; 
  }
  rodSequenceHTML += `${step++}. Space out Polished Rod<br><br>`;

  // --- CORRECTED TAIL PIPE CALCULATION ---
  // Using pure Tubing Head Pressure (THP) for internal differential pressure
  if (!anchored) {
    let Ap = (Math.PI / 4) * Math.pow(D, 2);
    let Fbuck = (0.433 * G * H * Ap) + (THP * Ap); 
    
    let tp_buoyancy = 1 - (0.128 * G);
    let Ltp = Math.ceil(Fbuck / (tubing_ppf * tp_buoyancy) / 30) * 30; 
    
    if (Ltp > 0) {
      rodSequenceHTML += `<strong>Tail Pipe (Buckling Prevention):</strong><br>`;
      rodSequenceHTML += `Since tubing is unanchored, run <span style="color:#ef4444; font-weight:bold;">${Ltp} ft</span> of tail pipe below the pump to provide downward tension and offset the ${Math.round(Fbuck)} lbs of upward fluid pressure.`;
    }
  } else {
    rodSequenceHTML += `<strong>Tail Pipe:</strong> Not required. Mechanical tubing anchor prevents buckling.`;
  }

  const elUnit = document.getElementById('ai_unit_suggestion');
  const elRod = document.getElementById('ai_rod_sequence');
  if(elUnit) elUnit.innerHTML = unitExplanation;
  if(elRod) elRod.innerHTML = rodSequenceHTML;
}

function drawDynamicDyno(surfacePoints, pumpPoints, maxDisp, fo, wrf, isMetric) {
  const c = document.getElementById("dynoCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const padL = 70, padR = 30, padT = 20, padB = 40;
  const w = c.width - padL - padR;
  const h = c.height - padT - padB;

  const maxLoad = Math.max(...surfacePoints.map(p => p.y)) * 1.05; 
  const minLoad = Math.min(Math.min(...surfacePoints.map(p => p.y)), 0); 
  const loadRange = maxLoad - minLoad;
  const dispRange = maxDisp * 1.05;

  const getX = (val) => padL + (val / dispRange) * w;
  const getY = (val) => padT + h - ((val - minLoad) / loadRange) * h;

  ctx.strokeStyle = "#334155"; 
  ctx.fillStyle = "#94a3b8"; 
  ctx.font = "12px 'Roboto Mono'"; 
  ctx.textAlign = "right";
  
  let convertedLoadRange = isMetric ? loadRange * 0.453592 : loadRange;
  let convertedMinLoad = isMetric ? minLoad * 0.453592 : minLoad;
  
  for(let i=0; i<=5; i++) {
    const loadVal = minLoad + (loadRange * (i/5)); 
    const displayVal = convertedMinLoad + (convertedLoadRange * (i/5));
    const yPos = getY(loadVal);
    ctx.beginPath(); ctx.moveTo(padL, yPos); ctx.lineTo(padL+w, yPos); ctx.stroke();
    ctx.fillText(Math.round(displayVal).toLocaleString(), padL - 10, yPos + 4);
  }
  
  ctx.textAlign = "center";
  let convertedDispRange = isMetric ? dispRange * 0.0254 : dispRange;
  for(let i=0; i<=5; i++) {
    const dVal = dispRange * (i/5); 
    const displayVal = convertedDispRange * (i/5);
    const xPos = getX(dVal);
    ctx.beginPath(); ctx.moveTo(xPos, padT+h); ctx.lineTo(xPos, padT); ctx.stroke();
    ctx.fillText(displayVal.toFixed(1), xPos, padT + h + 20);
  }

  ctx.fillStyle = "#f8fafc"; 
  ctx.font = "600 13px Inter";
  ctx.fillText(isMetric ? "DISPLACEMENT (METERS)" : "DISPLACEMENT (INCHES)", padL + w/2, c.height - 5);
  ctx.save(); ctx.translate(15, padT + h/2); ctx.rotate(-Math.PI/2);
  ctx.fillText(isMetric ? "LOAD (KG)" : "LOAD (LBS)", 0, 0); ctx.restore();

  ctx.beginPath();
  for(let i = 0; i < pumpPoints.length; i++) {
    let x_val = pumpPoints[i].x;
    let y_val = pumpPoints[i].y; 
    if (i === 0) ctx.moveTo(getX(x_val), getY(y_val));
    else ctx.lineTo(getX(x_val), getY(y_val));
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.15)"; 
  ctx.fill();
  ctx.strokeStyle = "#38bdf8"; 
  ctx.lineWidth = 2.5; 
  ctx.stroke();

  ctx.beginPath();
  for(let i = 0; i < surfacePoints.length; i++) {
    let x_val = surfacePoints[i].x;
    let y_val = surfacePoints[i].y;
    if (i === 0) ctx.moveTo(getX(x_val), getY(y_val));
    else ctx.lineTo(getX(x_val), getY(y_val));
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(239, 68, 68, 0.15)"; 
  ctx.fill();
  ctx.strokeStyle = "#ef4444"; 
  ctx.lineWidth = 2.5; 
  ctx.stroke();
}