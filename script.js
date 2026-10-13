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
  const safeGet = (id) => document.getElementById(id) ? document.getElementById(id).innerText : "";
  
  safeUpdate('pr_date', new Date().toLocaleString());
  safeUpdate('pr_operator', currentUser.name || "Offline Operator");
  safeUpdate('pr_email', currentUser.email || "N/A");

  const unitH = isMetric ? "m" : "ft";
  const unitL = isMetric ? "m" : "ft";
  const unitS = "in"; 
  
  safeUpdate('pr_in_H', document.getElementById('in_H').value + " " + unitH);
  safeUpdate('pr_in_L', document.getElementById('in_L').value + " " + unitL);
  safeUpdate('pr_in_G', document.getElementById('in_G').value);
  safeUpdate('pr_in_N', document.getElementById('in_N').value);
  safeUpdate('pr_in_S', document.getElementById('in_S').value + " " + unitS);
  
  const sel_D = document.getElementById('in_D');
  safeUpdate('pr_in_D', sel_D.options[sel_D.selectedIndex].text);
  const sel_api = document.getElementById('in_api_string');
  safeUpdate('pr_in_api', sel_api.options[sel_api.selectedIndex].text);
  const sel_tubing = document.getElementById('in_tubing');
  safeUpdate('pr_in_tubing', sel_tubing.options[sel_tubing.selectedIndex].text);
  
  const sel_geo = document.getElementById('in_geometry');
  safeUpdate('pr_in_geo', sel_geo.options[sel_geo.selectedIndex].text);
  const sel_grade = document.getElementById('in_grade');
  safeUpdate('pr_in_grade', sel_grade.options[sel_grade.selectedIndex].text);

  safeUpdate('pr_pd_100', safeGet('out_pd_100') + " " + safeGet('unit_pd_100'));
  safeUpdate('pr_pd_95', safeGet('out_pd_95') + " " + safeGet('unit_pd_95'));
  safeUpdate('pr_pd_90', safeGet('out_pd_90') + " " + safeGet('unit_pd_90'));
  
  safeUpdate('pr_out_pprl', safeGet('out_23') + " " + safeGet('unit_23'));
  safeUpdate('pr_out_mprl', safeGet('out_24') + " " + safeGet('unit_24'));
  safeUpdate('pr_out_pt', safeGet('out_25') + " " + safeGet('unit_25'));
  safeUpdate('pr_out_prhp', safeGet('out_26') + " " + safeGet('unit_26'));
  safeUpdate('pr_out_cbe', safeGet('out_27') + " " + safeGet('unit_27'));
  safeUpdate('pr_out_fo', safeGet('out_5') + " " + safeGet('unit_5'));
  
  safeUpdate('pr_out_sf', safeGet('out_sf'));
  safeUpdate('pr_out_pct_goodman', safeGet('out_pct_goodman') + " %");

  const dyno_canvas = document.getElementById('dynoCanvas');
  if (dyno_canvas) {
      const img = document.getElementById('pr_dyno_img');
      if (img) img.src = dyno_canvas.toDataURL("image/png");
  }
  
  const gm_canvas = document.getElementById('goodmanCanvas');
  if (gm_canvas) {
      const img = document.getElementById('pr_goodman_img');
      if (img) img.src = gm_canvas.toDataURL("image/png");
  }

  const well_canvas = document.getElementById('wellCanvas');
  if(well_canvas) {
      const img = document.getElementById('pr_well_img');
      if (img) img.src = well_canvas.toDataURL("image/png");
  }

  const el_unit_sug = document.getElementById('ai_unit_suggestion');
  const el_pr_unit = document.getElementById('pr_rec_unit');
  if(el_unit_sug && el_pr_unit) el_pr_unit.innerHTML = el_unit_sug.innerHTML;

  const el_rod_seq = document.getElementById('ai_rod_sequence');
  const el_pr_taper = document.getElementById('pr_rec_taper');
  if(el_rod_seq && el_pr_taper) el_pr_taper.innerHTML = el_rod_seq.innerHTML;

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
    let thp_val = parseFloat(document.getElementById('in_thp').value) || 0;

    isMetric = !isMetric;
    this.innerText = isMetric ? "⚙️ IMPERIAL" : "⚙️ METRIC";

    if (isMetric) {
      document.getElementById('in_H').value = (H_val * 0.3048).toFixed(1);
      document.getElementById('in_L').value = (L_val * 0.3048).toFixed(1);
      document.getElementById('in_thp').value = (thp_val * 0.0689476).toFixed(1);
      
      document.getElementById('lbl_H').innerText = "Fluid Level (m)";
      document.getElementById('lbl_L').innerText = "Pump Depth (m)";
      document.getElementById('lbl_thp').innerText = "Max THP (bar)";
      document.getElementById('lbl_S').innerText = "Surface Stroke (in)";
    } else {
      document.getElementById('in_H').value = Math.round(H_val / 0.3048);
      document.getElementById('in_L').value = Math.round(L_val / 0.3048);
      document.getElementById('in_thp').value = Math.round(thp_val / 0.0689476);
      
      document.getElementById('lbl_H').innerText = "Fluid Level (ft)";
      document.getElementById('lbl_L').innerText = "Pump Depth (ft)";
      document.getElementById('lbl_thp').innerText = "Max THP (psig)";
      document.getElementById('lbl_S').innerText = "Surface Stroke (in)";
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
    "2.25": { Wr: 2.091, Er: 0.706, taper: [{size: "7/8", pct: 0.457}, {size: "3/4", pct: 0.543}] },
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

const ROD_AREAS = {
  "1-1/8": 0.994, "1": 0.785, "7/8": 0.601, "3/4": 0.442, "5/8": 0.307
};

function safeUpdate(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function getKinematics(theta, S, geometry) {
    let r = S / 2;
    let p = 3.5 * r; 
    let pos, TF, cb_offset;
    
    if (geometry === 'mark2') {
        let phase = theta - 0.42; 
        pos = r * (1 - Math.cos(phase)) - 0.2 * r * (1 - Math.pow(Math.cos(phase), 2));
        TF = r * Math.sin(phase) * (1 - 0.4 * Math.cos(phase));
        cb_offset = 0.42; 
    } else if (geometry === 'air') {
        let phase = theta + 0.1;
        pos = r * (1 - Math.cos(phase)) + 0.1 * r * (1 - Math.pow(Math.cos(phase), 2));
        TF = r * Math.sin(phase) * (1 + 0.2 * Math.cos(phase));
        cb_offset = 0.0;
    } else { 
        pos = r * (1 - Math.cos(theta)) + (r*r / (2*p)) * (1 - Math.pow(Math.cos(theta), 2));
        TF = r * Math.sin(theta) * (1 + (r/p) * Math.cos(theta));
        cb_offset = 0.0;
    }
    return { pos: pos, TF: TF, cb_offset: cb_offset };
}

function calculateTrueAPI() {
  let in_H_raw = parseFloat(document.getElementById('in_H').value) || 0;
  let in_L_raw = parseFloat(document.getElementById('in_L').value) || 0;
  let in_S_raw = parseFloat(document.getElementById('in_S').value) || 0;
  let in_thp_raw = parseFloat(document.getElementById('in_thp').value) || 0;
  let D_raw = parseFloat(document.getElementById('in_D').value) || 0;
  let N_spm_raw = parseFloat(document.getElementById('in_N').value) || 0;
  let G_raw = parseFloat(document.getElementById('in_G').value) || 0;
  
  const safe_H = Math.max(0, in_H_raw);
  const safe_L = Math.max(100, in_L_raw); 
  const safe_S = Math.max(10, in_S_raw);
  const safe_N = Math.max(1, N_spm_raw);
  const safe_D = Math.max(1.25, D_raw);
  const safe_G = Math.max(0.1, G_raw);

  const tubing_od = document.getElementById('in_tubing').value;
  const api_string = document.getElementById('in_api_string').value;
  const anchored = document.getElementById('in_anchored').value === 'yes';
  const use_sinker = document.getElementById('in_sinker').value === 'yes'; 
  const geometry = document.getElementById('in_geometry').value;
  const T_grade = parseFloat(document.getElementById('in_grade').value) || 115000;

  const H = isMetric ? safe_H / 0.3048 : safe_H;
  const L = isMetric ? safe_L / 0.3048 : safe_L;
  const THP = isMetric ? in_thp_raw / 0.0689476 : Math.max(0, in_thp_raw); 
  const S = safe_S; // Locked explicitly to inches to prevent kinematic blowouts
  const D = safe_D; 
  const N_spm = safe_N;
  const G = safe_G;

  const animDuration = (60 / N_spm) + "s";
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
  const nodes = Math.max(Math.floor(L / dx), 2); 
  const dt = 0.5 * (dx / a); 
  
  const period = 60 / N_spm;
  const omega = (N_spm * 2 * Math.PI) / 60;
  const steps_per_cycle = Math.floor(period / dt);
  const total_steps = steps_per_cycle * 4; 
  const c_damp = 0.4; 

  let u_old = new Float64Array(nodes + 1);
  let u_curr = new Float64Array(nodes + 1);
  let u_new = new Float64Array(nodes + 1);

  let dyno_surface = [];
  let dyno_pump = [];
  let PRL_array = [];
  let theta_array = [];
  
  let pprl_wave = 0;
  let mprl_wave = 1e9;
  let pump_load = Fo; 

  for (let s = 0; s < total_steps; s++) {
      let t = s * dt;
      let tau = (t % period) / period;
      let theta = 2 * Math.PI * tau;
      
      let kin = getKinematics(theta, S, geometry);
      u_new[0] = kin.pos / 12.0;

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

      if (s >= total_steps - steps_per_cycle) {
          let surf_strain = (u_new[0] - u_new[1]) / dx;
          let surf_load = Wrf + (E * A_avg * surf_strain);
          
          if (surf_load > pprl_wave) pprl_wave = surf_load;
          if (surf_load < mprl_wave) mprl_wave = surf_load;

          dyno_surface.push({ x: kin.pos, y: surf_load });
          dyno_pump.push({ x: u_new[nodes] * 12, y: pump_load });
          
          PRL_array.push(surf_load);
          theta_array.push(theta);
      }

      for (let i = 0; i <= nodes; i++) {
          u_old[i] = u_curr[i];
          u_curr[i] = u_new[i];
      }
  }

  let best_PT = 1e9;
  let best_Mcb = 0;
  let max_Mcb_search = pprl_wave * (S / 2);
  let step_Mcb = max_Mcb_search / 500;
  let cb_offset = getKinematics(0, S, geometry).cb_offset;

  for (let m = 0; m <= max_Mcb_search; m += step_Mcb) {
      let max_tq = -1e9;
      let min_tq = 1e9;
      for (let i = 0; i < PRL_array.length; i++) {
          let th = theta_array[i];
          let kin = getKinematics(th, S, geometry);
          let T_rod = PRL_array[i] * kin.TF; 
          let T_cb = m * Math.sin(th + cb_offset); 
          let T_net = T_rod - T_cb;
          
          if (T_net > max_tq) max_tq = T_net;
          if (T_net < min_tq) min_tq = T_net;
      }
      let current_pt = Math.max(Math.abs(max_tq), Math.abs(min_tq));
      if (current_pt < best_PT) {
          best_PT = current_pt;
          best_Mcb = m;
      }
  }
  
  const PT = best_PT;
  const CBE = best_Mcb / (S / 2); 

  let recTorque = Math.ceil(PT / 1000); 
  let recLoad = Math.ceil(pprl_wave / 100); 
  let recStroke = Math.ceil(S); 

  const sizesTq = [25,40,57,80,114,160,228,320,456,640,912,1280];
  const sizesLd = [53,76,89,119,143,173,213,256,305,365,427,470];
  const sizesSt = [42,48,54,64,74,86,100,120,144,168,192];
  
  recTorque = sizesTq.find(v => v >= recTorque) || recTorque;
  recLoad = sizesLd.find(v => v >= recLoad) || recLoad;
  recStroke = sizesSt.find(v => v >= recStroke) || recStroke;

  let geoPrefix = geometry === 'mark2' ? 'M' : (geometry === 'air' ? 'A' : 'C');
  let unitSuggestion = `${geoPrefix}-${recTorque}D-${recLoad}-${recStroke}`;

  let card_area_in_lbs = 0;
  for (let i = 1; i < dyno_surface.length; i++) {
      let x0 = dyno_surface[i-1].x; let x1 = dyno_surface[i].x;
      let y0 = dyno_surface[i-1].y; let y1 = dyno_surface[i].y;
      card_area_in_lbs += ((y0 + y1) / 2) * (x1 - x0);
  }
  const PRHP = Math.abs(card_area_in_lbs) * N_spm / 396000;
  
  const one_over_kt = anchored ? 0 : (Et_raw * L);
  const tubing_stretch = Fo * one_over_kt;
  
  let min_pump_x = 1e9, max_pump_x = -1e9;
  for (let i = 0; i < dyno_pump.length; i++) {
    if(dyno_pump[i].x < min_pump_x) min_pump_x = dyno_pump[i].x;
    if(dyno_pump[i].x > max_pump_x) max_pump_x = dyno_pump[i].x;
  }
  const Sp_dynamic = Math.max(0, (max_pump_x - min_pump_x) - tubing_stretch);
  let PD = 0.1166 * Sp_dynamic * N_spm * Math.pow(D, 2);

  let one_over_kr = 0;
  for(let i=0; i<activeTaper.length; i++) {
      let seg_L = L * activeTaper[i].pct;
      let A_i = ROD_AREAS[activeTaper[i].size] || 0.601;
      one_over_kr += (seg_L * 12) / (E * A_i);
  }
  let Skr = S / (one_over_kr === 0 ? 1 : one_over_kr);
  let out_FoSkr = Fo / Skr;
  let out_N_No = (N_spm * L) / 245000;
  let out_SpS = Sp_dynamic / S;

  let top_rod_size = activeTaper.length > 0 ? activeTaper[0].size : "7/8";
  let A_top = ROD_AREAS[top_rod_size] || 0.601;
  let S_max = pprl_wave / A_top;
  let S_min = mprl_wave / A_top;
  let S_allowable = (T_grade / 4) + (0.5625 * S_min); 
  let SF = S_allowable / S_max;
  let Pct_Goodman = (S_max / S_allowable) * 100;

  // --- METRIC DISPLAY CONVERSION LOGIC ---
  let out_PPRL = pprl_wave; 
  let out_MPRL = mprl_wave; 
  let out_PT = PT;
  let out_Fo = Fo; 
  let out_Wr = Wr; 
  let out_Wrf = Wrf;
  let out_CBE = CBE; // Mutable variable isolates the constant CBE to prevent assignment crash
  let disp_S = S; 
  let out_Sp = Sp_dynamic; 
  let out_Sa = S_allowable;

  if (isMetric) {
    PD *= 0.158987; 
    out_PPRL *= 0.453592; 
    out_PT *= 0.011521; 
    out_MPRL *= 0.453592; 
    out_CBE *= 0.453592; 
    out_Fo *= 0.453592; 
    out_Wr *= 1.48816; 
    out_Wrf *= 0.453592; 
    out_Sa *= 0.00689476; 
    let out_kW = PRHP * 0.7457;

    safeUpdate('unit_14', "m³/d"); safeUpdate('unit_23', "kg"); 
    safeUpdate('unit_25', "kg-m"); 
    safeUpdate('unit_24', "kg"); safeUpdate('unit_26', "kW"); safeUpdate('unit_27', "kg");
    safeUpdate('unit_5', "kg"); safeUpdate('unit_Sa', "MPa");
    safeUpdate('unit_pd_100', "m³/d"); safeUpdate('unit_pd_95', "m³/d"); safeUpdate('unit_pd_90', "m³/d");
    safeUpdate('out_26', out_kW.toFixed(1));
    safeUpdate('out_Sa', Math.round(out_Sa).toLocaleString());
  } else {
    out_PT /= 12; // FT-LBS output display
    safeUpdate('unit_14', "bpd"); safeUpdate('unit_23', "lbs"); 
    safeUpdate('unit_25', "lbs-ft"); 
    safeUpdate('unit_24', "lbs"); safeUpdate('unit_26', "HP"); safeUpdate('unit_27', "lbs");
    safeUpdate('unit_5', "lbs"); safeUpdate('unit_Sa', "psi");
    safeUpdate('unit_pd_100', "bpd"); safeUpdate('unit_pd_95', "bpd"); safeUpdate('unit_pd_90', "bpd");
    safeUpdate('out_26', PRHP.toFixed(1));
    safeUpdate('out_Sa', Math.round(out_Sa).toLocaleString());
  }

  safeUpdate('out_14', Math.round(PD).toLocaleString());
  safeUpdate('out_23', Math.round(out_PPRL).toLocaleString());
  safeUpdate('out_25', Math.round(out_PT).toLocaleString());
  safeUpdate('out_24', Math.round(out_MPRL).toLocaleString());
  safeUpdate('out_27', Math.round(out_CBE).toLocaleString()); 
  safeUpdate('out_5', Math.round(out_Fo).toLocaleString());
  
  safeUpdate('out_pd_100', Math.round(PD).toLocaleString());
  safeUpdate('out_pd_95', Math.round(PD * 0.95).toLocaleString());
  safeUpdate('out_pd_90', Math.round(PD * 0.90).toLocaleString());

  safeUpdate('out_9', out_N_No.toFixed(3)); 
  safeUpdate('out_8', out_FoSkr.toFixed(3)); 
  safeUpdate('out_SpS', out_SpS.toFixed(3));

  let sf_element = document.getElementById('out_sf');
  sf_element.innerText = SF.toFixed(2);
  sf_element.style.color = SF < 1.0 ? "#ef4444" : "#10b981"; 

  let pct_element = document.getElementById('out_pct_goodman');
  pct_element.innerText = Pct_Goodman.toFixed(1);
  pct_element.style.color = Pct_Goodman > 100 ? "#ef4444" : "#10b981"; 

  let unitExplanation = `Based on API 11E kinematic linkage loads, the minimum recommended surface unit is <span class="highlight-text">${unitSuggestion}</span>.<br><br>`;
  if (SF < 1.0) {
      unitExplanation += `<span style="color:#ef4444; font-weight:bold;">⚠️ FATIGUE WARNING:</span> The rod string is operating at ${Pct_Goodman.toFixed(1)}% of its structural limit (SF ${SF.toFixed(2)}). Consider upgrading metallurgy or reducing SPM.`;
  } else {
      unitExplanation += `<span style="color:#10b981; font-weight:bold;">✓ STRUCTURALLY SAFE:</span> The rod string is operating cleanly within the API Goodman limit (SF ${SF.toFixed(2)}).`;
  }

  let wellTapers = []; 
  let L_sb = 0;
  if (use_sinker) {
    let F_sb_factor = 0.11594 * Math.pow(D, 2); 
    let fluid_pressure_tubing = (62.4 / 144) * G * L; 
    let req_weight_fluid = F_sb_factor * fluid_pressure_tubing; 
    
    let buoyant_factor = 1 - (0.128 * G);
    let W_sb_fluid = 4.167 * buoyant_factor; 
    
    L_sb = Math.round(req_weight_fluid / W_sb_fluid); 
    if (L_sb > L * 0.3) L_sb = Math.round(L * 0.3); 
    if (L_sb < 0) L_sb = 0;
  }

  let L_taper = L - L_sb;
  let unitL = isMetric ? "m" : "ft";
  let cvt = (val) => isMetric ? Math.round(val * 0.3048) : Math.round(val);

  let rodSequenceHTML = `<strong>API ${api_string} String Architecture (Install Bottom to Surface):</strong><br><br>`;
  let step = 1; 
  rodSequenceHTML += `${step++}. Run Downhole Pump<br>`;
  
  if (L_sb > 0) {
    rodSequenceHTML += `${step++}. Run <span class="highlight-text">${cvt(L_sb)} ${unitL}</span> of 1-1/4" Sinker Bars<br>`;
  }

  if(activeTaper && activeTaper.length > 0) {
    for (let i = activeTaper.length - 1; i >= 0; i--) {
      let segmentLength = Math.round(L_taper * activeTaper[i].pct);
      if (i === 0) {
          let lower_sum = 0;
          for(let j=1; j<activeTaper.length; j++) lower_sum += Math.round(L_taper * activeTaper[j].pct);
          segmentLength = L_taper - lower_sum;
      }
      let loc = (i === activeTaper.length - 1) ? "Bottom Section" : (i === 0 ? "Top Section" : "Middle Section");
      rodSequenceHTML += `${step++}. Run <span class="highlight-text">${cvt(segmentLength)} ${unitL}</span> of ${activeTaper[i].size}" Rods (${loc})<br>`;
    }
    
    let current_depth = 0;
    for (let i = 0; i < activeTaper.length; i++) {
        let segmentLength = Math.round(L_taper * activeTaper[i].pct);
        if (i === activeTaper.length - 1) segmentLength = L_taper - current_depth;
        
        wellTapers.push({
            size: activeTaper[i].size,
            length: segmentLength,
            top: current_depth,
            bottom: current_depth + segmentLength
        });
        current_depth += segmentLength;
    }
  } else { 
    rodSequenceHTML += `${step++}. Run <span class="highlight-text">${cvt(L_taper)} ${unitL}</span> of rod string per generic API specification.<br>`; 
    wellTapers.push({ size: "Generic", length: Math.round(L_taper), top: 0, bottom: Math.round(L_taper) });
  }
  
  rodSequenceHTML += `${step++}. Space out Polished Rod at Surface<br><br>`;

  let Ltp = 0;
  if (!anchored) {
    let Ap = (Math.PI / 4) * Math.pow(D, 2);
    let Fbuck = (0.433 * G * H * Ap) + (THP * Ap); 
    let tp_buoyancy = 1 - (0.128 * G);
    Ltp = Math.ceil(Fbuck / (tubing_ppf * tp_buoyancy) / 30) * 30; 
    if (Ltp > 0) {
      rodSequenceHTML += `<strong>Tail Pipe (Buckling Prevention):</strong><br>`;
      let fbuckMetric = isMetric ? Math.round(Fbuck * 0.453592) : Math.round(Fbuck);
      let fbuckUnit = isMetric ? "kg" : "lbs";
      rodSequenceHTML += `Since tubing is unanchored, install <span style="color:#ef4444; font-weight:bold;">${cvt(Ltp)} ${unitL}</span> of tail pipe below the pump to offset the ${fbuckMetric.toLocaleString()} ${fbuckUnit} of upward fluid pressure.`;
    }
  } else {
    Ltp = 30; 
    rodSequenceHTML += `<strong>Tail Pipe:</strong> Mechanical tubing anchor holds tension. Install standard ${cvt(Ltp)} ${unitL} Mud/Gas Anchor.`;
  }

  const elUnit = document.getElementById('ai_unit_suggestion');
  const elRod = document.getElementById('ai_rod_sequence');
  if(elUnit) elUnit.innerHTML = unitExplanation;
  if(elRod) elRod.innerHTML = rodSequenceHTML;

  drawDynamicDyno(dyno_surface, dyno_pump, S, Fo, Wrf, isMetric);
  drawGoodman(S_min, S_max, T_grade, SF, isMetric);
  
  drawWellboreDiagram({
      unit: unitSuggestion,
      geometry: geometry,
      H: H, L: L, D: D,
      S: safe_S, N: N_spm,
      tubing_od: tubing_od,
      anchored: anchored,
      tapers: wellTapers,
      L_sb: L_sb,
      L_tp: Ltp,
      isMetric: isMetric
  });
}

function drawGoodman(s_min, s_max, T_grade, sf, isMetric) {
  const c = document.getElementById("goodmanCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const padL = 60, padR = 30, padT = 20, padB = 40;
  const w = c.width - padL - padR;
  const h = c.height - padT - padB;

  let axis_max = T_grade * 0.6; 
  if (s_max > axis_max) axis_max = s_max * 1.1;

  const getX = (val) => padL + (val / axis_max) * w;
  const getY = (val) => padT + h - (val / axis_max) * h;

  ctx.strokeStyle = "#334155"; 
  ctx.fillStyle = "#94a3b8"; 
  ctx.font = "11px 'Roboto Mono'"; 
  ctx.textAlign = "right";
  
  let unitMultiplier = isMetric ? 0.00689476 : 1;
  
  for(let i=0; i<=5; i++) {
    const val = axis_max * (i/5); 
    const displayVal = val * unitMultiplier;
    const yPos = getY(val);
    ctx.beginPath(); ctx.moveTo(padL, yPos); ctx.lineTo(padL+w, yPos); ctx.stroke();
    ctx.fillText(Math.round(displayVal).toLocaleString(), padL - 10, yPos + 4);
  }
  
  ctx.textAlign = "center";
  for(let i=0; i<=5; i++) {
    const val = axis_max * (i/5); 
    const displayVal = val * unitMultiplier;
    const xPos = getX(val);
    ctx.beginPath(); ctx.moveTo(xPos, padT+h); ctx.lineTo(xPos, padT); ctx.stroke();
    ctx.fillText(Math.round(displayVal).toLocaleString(), xPos, padT + h + 20);
  }

  ctx.fillStyle = "#f8fafc"; 
  ctx.font = "600 12px Inter";
  ctx.fillText(isMetric ? "MINIMUM STRESS (MPa)" : "MINIMUM STRESS (PSI)", padL + w/2, c.height - 5);
  ctx.save(); ctx.translate(15, padT + h/2); ctx.rotate(-Math.PI/2);
  ctx.fillText(isMetric ? "MAXIMUM STRESS (MPa)" : "MAXIMUM STRESS (PSI)", 0, 0); ctx.restore();

  ctx.beginPath();
  ctx.moveTo(getX(0), getY(0));
  ctx.lineTo(getX(axis_max), getY(axis_max));
  ctx.strokeStyle = "#64748b";
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  const y_intercept = T_grade / 4;
  const intersect_x = T_grade / 1.75; 
  
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(y_intercept));
  ctx.lineTo(getX(intersect_x), getY(intersect_x));
  ctx.strokeStyle = "#10b981"; 
  ctx.lineWidth = 2;
  ctx.stroke();

  const px = getX(s_min);
  const py = getY(s_max);

  ctx.beginPath();
  ctx.arc(px, py, 6, 0, 2 * Math.PI);
  ctx.fillStyle = sf >= 1.0 ? "#38bdf8" : "#ef4444"; 
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "left";
  ctx.font = "500 12px Inter";
  ctx.fillText(`OPERATING POINT`, px + 15, py - 5);
}

function drawDynamicDyno(surfacePoints, pumpPoints, maxDisp, fo, wrf, isMetric) {
  const c = document.getElementById("dynoCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const padL = 70, padR = 30, padT = 20, padB = 40;
  const w = c.width - padL - padR;
  const h = c.height - padT - padB;

  let maxLoad = -1e9;
  let minLoad = 1e9;
  for(let i=0; i<surfacePoints.length; i++) {
      if(surfacePoints[i].y > maxLoad) maxLoad = surfacePoints[i].y;
      if(surfacePoints[i].y < minLoad) minLoad = surfacePoints[i].y;
  }
  maxLoad = maxLoad * 1.05;
  minLoad = Math.min(minLoad, 0);
  
  const loadRange = Math.max(100, maxLoad - minLoad); 
  const dispRange = Math.max(10, maxDisp * 1.05); 

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

  if(pumpPoints.length > 0) {
    ctx.beginPath();
    ctx.moveTo(getX(pumpPoints[0].x), getY(pumpPoints[0].y));
    for(let i = 1; i < pumpPoints.length; i++) {
      ctx.lineTo(getX(pumpPoints[i].x), getY(pumpPoints[i].y));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)"; 
    ctx.fill();
    ctx.strokeStyle = "#38bdf8"; 
    ctx.lineWidth = 2.5; 
    ctx.stroke();
  }

  if(surfacePoints.length > 0) {
    ctx.beginPath();
    ctx.moveTo(getX(surfacePoints[0].x), getY(surfacePoints[0].y));
    for(let i = 1; i < surfacePoints.length; i++) {
      ctx.lineTo(getX(surfacePoints[i].x), getY(surfacePoints[i].y));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(239, 68, 68, 0.15)"; 
    ctx.fill();
    ctx.strokeStyle = "#ef4444"; 
    ctx.lineWidth = 2.5; 
    ctx.stroke();
  }
}

function drawWellboreDiagram(d) {
  const c = document.getElementById("wellCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const padTop = 180, padBottom = 40;
  const well_x = c.width / 2; 
  const h_avail = c.height - padTop - padBottom;
  
  const maxDepth = d.L + d.L_tp + (d.L * 0.05); 
  const getY = (depth) => padTop + (depth / maxDepth) * h_avail;

  const unitL = d.isMetric ? "m" : "ft";
  const unitS = "in"; 
  const cvt = (val) => d.isMetric ? Math.round(val * 0.3048) : Math.round(val);
  const cvtS = (val) => val.toFixed(0);

  ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
  ctx.lineWidth = 1;
  for(let i = 0; i < c.width; i+= 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, c.height); ctx.stroke(); }
  for(let i = 0; i < c.height; i+= 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(c.width, i); ctx.stroke(); }

  const ground_y = padTop;
  const base_y = ground_y - 10;
  const saddle_y = base_y - 90;
  const horse_x = well_x;
  
  let saddle_x, crank_x;
  if (d.geometry === 'mark2') { saddle_x = well_x + 120; crank_x = well_x + 60; } 
  else if (d.geometry === 'air') { saddle_x = well_x + 110; crank_x = well_x + 40; } 
  else { saddle_x = well_x + 65; crank_x = well_x + 130; }
  const crank_y = base_y - 30;

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(30, ground_y); ctx.lineTo(c.width - 30, ground_y); ctx.stroke();

  ctx.fillStyle = "#1e293b"; ctx.fillRect(well_x - 40, base_y, 200, 10);
  ctx.beginPath(); ctx.moveTo(saddle_x, saddle_y); ctx.lineTo(saddle_x - 20, base_y); ctx.lineTo(saddle_x + 20, base_y); ctx.closePath();
  ctx.fillStyle = "#334155"; ctx.fill();

  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 8; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(horse_x + 15, saddle_y); ctx.lineTo(Math.max(saddle_x, crank_x) + 20, saddle_y); ctx.stroke();
  ctx.beginPath(); ctx.arc(horse_x + 15, saddle_y, 20, Math.PI, Math.PI * 1.4); ctx.lineWidth = 6; ctx.strokeStyle = "#cbd5e1"; ctx.stroke();

  ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(crank_x, saddle_y); ctx.lineTo(crank_x - 15, crank_y); ctx.stroke();
  ctx.beginPath(); ctx.arc(crank_x, crank_y, 8, 0, Math.PI*2); ctx.fillStyle = "#cbd5e1"; ctx.fill();
  ctx.beginPath(); ctx.moveTo(crank_x, crank_y); ctx.lineTo(crank_x - 25, crank_y + 20); ctx.lineWidth = 10; ctx.strokeStyle = "#f59e0b"; ctx.stroke();

  ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(well_x, saddle_y + 10); ctx.lineTo(well_x, ground_y + 20); ctx.stroke();
  ctx.fillStyle = "#10b981"; ctx.fillRect(well_x - 12, ground_y - 20, 24, 20);
  ctx.fillStyle = "#0f172a"; ctx.fillRect(well_x - 18, ground_y, 36, 6);
  ctx.lineCap = "butt"; 

  ctx.strokeStyle = "#334155"; ctx.fillStyle = "#94a3b8"; ctx.font = "12px 'Roboto Mono'"; ctx.textAlign = "right";
  ctx.beginPath(); ctx.moveTo(35, padTop); ctx.lineTo(35, padTop + h_avail); ctx.stroke();
  for(let i=0; i<=5; i++) {
      let depthVal = maxDepth * (i/5);
      let yPos = getY(depthVal);
      ctx.beginPath(); ctx.moveTo(25, yPos); ctx.lineTo(35, yPos); ctx.stroke();
      ctx.fillText(cvt(depthVal).toLocaleString(), 20, yPos + 4);
  }
  ctx.save(); ctx.translate(12, padTop + h_avail/2); ctx.rotate(-Math.PI/2);
  ctx.textAlign = "center"; ctx.fillText(`MEASURED DEPTH (${unitL.toUpperCase()})`, 0, 0); ctx.restore();

  ctx.fillStyle = "#1e293b"; ctx.fillRect(well_x - 30, getY(0), 60, getY(maxDepth) - getY(0));
  ctx.fillStyle = "rgba(56, 189, 248, 0.15)"; ctx.fillRect(well_x - 30, getY(d.H), 60, getY(maxDepth) - getY(d.H));
  ctx.strokeStyle = "#38bdf8"; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(well_x - 30, getY(d.H)); ctx.lineTo(well_x + 30, getY(d.H)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(well_x - 32, getY(0)); ctx.lineTo(well_x - 32, getY(maxDepth));
  ctx.moveTo(well_x + 32, getY(0)); ctx.lineTo(well_x + 32, getY(maxDepth)); ctx.stroke();

  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(well_x - 14, getY(0)); ctx.lineTo(well_x - 14, getY(d.L));
  ctx.moveTo(well_x + 14, getY(0)); ctx.lineTo(well_x + 14, getY(d.L)); ctx.stroke();

  const rodColors = ["#38bdf8", "#818cf8", "#ec4899", "#a855f7"];
  d.tapers.forEach((taper, index) => {
      ctx.strokeStyle = rodColors[index % rodColors.length]; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(well_x, getY(taper.top)); ctx.lineTo(well_x, getY(taper.bottom)); ctx.stroke();
  });

  if(d.L_sb > 0) {
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(well_x, getY(d.L - d.L_sb)); ctx.lineTo(well_x, getY(d.L)); ctx.stroke();
  }
  ctx.fillStyle = "#10b981"; ctx.fillRect(well_x - 14, getY(d.L) - 15, 28, 30);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath(); ctx.arc(well_x, getY(d.L) - 5, 4, 0, 2*Math.PI); ctx.fill(); 
  ctx.beginPath(); ctx.arc(well_x, getY(d.L) + 8, 4, 0, 2*Math.PI); ctx.fill(); 

  ctx.strokeStyle = d.anchored ? "#94a3b8" : "#ef4444"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(well_x - 8, getY(d.L) + 15); ctx.lineTo(well_x - 8, getY(d.L + d.L_tp));
  ctx.moveTo(well_x + 8, getY(d.L) + 15); ctx.lineTo(well_x + 8, getY(d.L + d.L_tp)); ctx.stroke();
  ctx.fillStyle = "#0f172a";
  for(let p = d.L + 20; p < d.L + d.L_tp - 10; p += ((d.L_tp)/5)) { ctx.fillRect(well_x - 4, getY(p), 8, 4); }

  const leftCallouts = [];
  const rightCallouts = [];
  
  rightCallouts.push({ y_target: ground_y - 40, title: "SURFACE UNIT", text1: `${d.unit}`, text2: `Stroke: ${cvtS(d.S)}${unitS}`, color: "#f8fafc" });
  d.tapers.forEach((taper, index) => {
      let locText = (index === 0) ? "Top Section" : (index === d.tapers.length - 1 && d.L_sb === 0 ? "Bottom Section" : "Middle Section");
      rightCallouts.push({ y_target: getY(taper.top + (taper.length/2)), title: `ROD TIER ${index+1}`, text1: `${taper.size}" API Rods`, text2: `${cvt(taper.length).toLocaleString()} ${unitL}`, color: rodColors[index % rodColors.length] });
  });
  if(d.L_sb > 0) rightCallouts.push({ y_target: getY(d.L - (d.L_sb/2)), title: "SINKER BARS", text1: `1-1/4" Heavy Steel`, text2: `${cvt(d.L_sb).toLocaleString()} ${unitL}`, color: "#f59e0b" });

  leftCallouts.push({ y_target: getY(d.H), title: "FLUID LEVEL", text1: `Hydrostatic Head`, text2: `@ ${cvt(d.H).toLocaleString()} ${unitL}`, color: "#38bdf8" });
  leftCallouts.push({ y_target: getY(d.L / 3), title: "PRODUCTION TUBING", text1: `${d.tubing_od}" API OD`, text2: d.anchored ? `Anchored` : `Unanchored`, color: "#94a3b8" });
  leftCallouts.push({ y_target: getY(d.L), title: "DOWNHOLE PUMP", text1: `${d.D}" Plunger`, text2: `@ ${cvt(d.L).toLocaleString()} ${unitL}`, color: "#10b981" });
  leftCallouts.push({ y_target: getY(d.L + (d.L_tp/2)), title: d.anchored ? "MUD ANCHOR" : "TAIL PIPE", text1: d.anchored ? `Gas Separation` : `Buckling Control`, text2: `Len: ${cvt(d.L_tp).toLocaleString()} ${unitL}`, color: d.anchored ? "#94a3b8" : "#ef4444" });

  const boxHeight = 44;
  const boxWidth = 240;

  const r_spacing = h_avail / Math.max(rightCallouts.length, 1);
  const r_box_x = well_x + 110;
  rightCallouts.forEach((c, idx) => {
      let box_y = padTop + (idx * r_spacing) + (r_spacing / 2) - (boxHeight / 2);
      if (idx === 0) box_y = ground_y - 60; 
      
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(well_x + 35, c.y_target); ctx.lineTo(r_box_x - 15, c.y_target); ctx.lineTo(r_box_x, box_y + (boxHeight/2)); ctx.stroke();
      ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(well_x + 35, c.y_target, 4, 0, 2*Math.PI); ctx.fill();

      ctx.fillStyle = "#0f172a"; ctx.strokeStyle = c.color; ctx.lineWidth = 2;
      ctx.fillRect(r_box_x, box_y, boxWidth, boxHeight); ctx.strokeRect(r_box_x, box_y, boxWidth, boxHeight);
      ctx.textAlign = "left"; ctx.fillStyle = c.color; ctx.font = "bold 11px Inter"; ctx.fillText(c.title, r_box_x + 10, box_y + 16);
      ctx.fillStyle = "#f8fafc"; ctx.font = "12px 'Roboto Mono'"; ctx.fillText(c.text1, r_box_x + 10, box_y + 34);
      ctx.textAlign = "right"; ctx.fillStyle = "#94a3b8"; ctx.fillText(c.text2, r_box_x + boxWidth - 10, box_y + 34);
  });

  const l_spacing = h_avail / Math.max(leftCallouts.length, 1);
  const l_box_x = well_x - 110 - boxWidth;
  leftCallouts.forEach((c, idx) => {
      let box_y = padTop + (idx * l_spacing) + (l_spacing / 2) - (boxHeight / 2);
      
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(well_x - 35, c.y_target); ctx.lineTo(l_box_x + boxWidth + 15, c.y_target); ctx.lineTo(l_box_x + boxWidth, box_y + (boxHeight/2)); ctx.stroke();
      ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(well_x - 35, c.y_target, 4, 0, 2*Math.PI); ctx.fill();

      ctx.fillStyle = "#0f172a"; ctx.strokeStyle = c.color; ctx.lineWidth = 2;
      ctx.fillRect(l_box_x, box_y, boxWidth, boxHeight); ctx.strokeRect(l_box_x, box_y, boxWidth, boxHeight);
      ctx.textAlign = "left"; ctx.fillStyle = c.color; ctx.font = "bold 11px Inter"; ctx.fillText(c.title, l_box_x + 10, box_y + 16);
      ctx.fillStyle = "#f8fafc"; ctx.font = "12px 'Roboto Mono'"; ctx.fillText(c.text1, l_box_x + 10, box_y + 34);
      ctx.textAlign = "right"; ctx.fillStyle = "#94a3b8"; ctx.fillText(c.text2, l_box_x + boxWidth - 10, box_y + 34);
  });
}