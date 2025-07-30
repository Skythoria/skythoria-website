
function generateYAML() {
  const name = document.getElementById("mobName").value || "MyMob";
  const display = document.getElementById("displayName").value || "&fUnnamed";
  const type = document.getElementById("entityType").value;
  const health = document.getElementById("health").value;
  const damage = document.getElementById("damage").value;

  const opts = ["AlwaysShowName", "Glowing", "Invisible", "Silent", "Despawn", "TargetNearest"];
  const numFields = ["Scale", "MovementSpeed", "AttackCooldown", "AttackKnockback"];

  let yaml = `${name}:
`;
  yaml += `  Type: ${type}
`;
  yaml += `  Display: '${display}'
`;
  yaml += `  Health: ${health}
`;
  yaml += `  Damage: ${damage}
`;
  yaml += `  Options:
`;
  opts.forEach(opt => {
    yaml += `    ${opt}: ${document.getElementById(opt).checked}
`;
  });
  numFields.forEach(opt => {
    yaml += `    ${opt}: ${document.getElementById(opt).value}
`;
  });

  yaml += `  Equipment:
`;
  ["hand", "offhand", "head", "chest", "legs", "feet"].forEach(slot => {
    const val = document.getElementById("equip_" + slot).value;
    if (val) yaml += `    - ${val} ${slot.toUpperCase()}
`;
  });

  const skills = document.getElementById("skills").value;
  if (skills) {
    yaml += `  Skills:
`;
    skills.split("\n").forEach(line => yaml += `    ${line}\n`);
  }

  const drops = document.getElementById("drops").value;
  if (drops) {
    yaml += `  Drops:
`;
    drops.split("\n").forEach(line => yaml += `    ${line}\n`);
  }

  yaml += `  DropsXP:\n    Min: ${document.getElementById("xpMin").value}\n    Max: ${document.getElementById("xpMax").value}\n`;

  document.getElementById("yamlOutput").value = yaml;
}

function addSkillTemplate() {
  const dropdown = document.getElementById("skillTemplates");
  const selected = dropdown.value;
  if (selected) {
    const textarea = document.getElementById("skills");
    textarea.value += (textarea.value ? "\n" : "") + selected;
    dropdown.selectedIndex = 0;
  }
}
