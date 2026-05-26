/* ============================================
   SYDE — script.js
   ============================================ */

// ─── CURSOR ───────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  cursorTrail.style.left = e.clientX + 'px';
  cursorTrail.style.top = e.clientY + 'px';
});

document.querySelectorAll('a,button,.work-card,.pricing-card,.about-card,.contact-link,.folder-item,.sidebar-file').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2.5)';
    cursor.style.background = 'var(--accent2)';
    cursorTrail.style.transform = 'translate(-50%,-50%) scale(1.4)';
    cursorTrail.style.borderColor = 'rgba(56,189,248,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    cursor.style.background = 'var(--accent)';
    cursorTrail.style.transform = 'translate(-50%,-50%) scale(1)';
    cursorTrail.style.borderColor = 'rgba(168,85,247,0.4)';
  });
});

// ─── NAV ──────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

// ─── SCROLL REVEAL ────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); revealObserver.unobserve(e.target); }});
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── HERO LINES ───────────────────────────────
const style = document.createElement('style');
style.textContent = `@keyframes slideUp{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}`;
document.head.appendChild(style);

document.querySelectorAll('.hero-title .reveal-line').forEach((line, i) => {
  const t = line.textContent;
  line.innerHTML = `<span style="display:block;animation:slideUp 0.9s cubic-bezier(0.22,1,0.36,1) ${0.2+i*0.12}s both">${t}</span>`;
});

// ─── SMOOTH SCROLL ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if(t){ e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 20, behavior:'smooth' }); }
  });
});

// ─── WORK CARD TILT ───────────────────────────
document.querySelectorAll('.work-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
    const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
    card.style.transform = `translateY(-8px) scale(1.01) rotateX(${-dy*4}deg) rotateY(${dx*4}deg)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// ─── PARALLAX ORBS ────────────────────────────
const orbs = document.querySelectorAll('.orb');
window.addEventListener('mousemove', (e) => {
  const rx = (e.clientX/window.innerWidth - 0.5)*2;
  const ry = (e.clientY/window.innerHeight - 0.5)*2;
  orbs.forEach((o,i) => { const f=(i+1)*12; o.style.transform=`translate(${rx*f}px,${ry*f}px)`; });
});

// ─── STAT COUNTERS ────────────────────────────
function animateCounter(el, target, suffix='') {
  const dur = 1800, start = performance.now(), isFloat = target%1!==0;
  function update(now) {
    const p = Math.min((now-start)/dur,1), eased=1-Math.pow(1-p,4), v=target*eased;
    el.textContent = isFloat ? v.toFixed(1)+suffix : Math.floor(v)+suffix;
    if(p<1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const statData = [{value:50,suffix:'+'},{value:100,suffix:'M+'},{value:5,suffix:'★'}];
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      const idx = Array.from(document.querySelectorAll('.stat-num')).indexOf(entry.target);
      if(statData[idx]) animateCounter(entry.target, statData[idx].value, statData[idx].suffix);
      statObserver.unobserve(entry.target);
    }
  });
},{threshold:0.5});
document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ─── ACTIVE NAV ───────────────────────────────
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.color = a.getAttribute('href')==='#'+e.target.id ? 'var(--text)' : '';
      });
    }
  });
},{threshold:0.4});
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ─── PAGE LOAD ────────────────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity='0'; document.body.style.transition='opacity 0.6s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.style.opacity='1'));
});


/* ============================================================
   FILE EXPLORER MODAL
   ============================================================ */

// ── LUA SOURCE DATA ──────────────────────────────────────────

const PROJECTS = {

  nexus: {
    name: "Project NEXUS — Combat System",
    files: {
      "CombatSystem": {
        type: "folder",
        children: {
          "CombatHandler.lua": `-- CombatHandler.lua
-- Manages combo chains, hitboxes, stamina, and state

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local HitEvent = Remotes:WaitForChild("HitEvent")
local BlockEvent = Remotes:WaitForChild("BlockEvent")

local Config = require(script.Parent.Config)
local HitboxUtil = require(script.Parent.HitboxUtil)
local StaminaModule = require(script.Parent.StaminaModule)
local AntiCheat = require(script.Parent.AntiCheat)

-- Player combat state table
local CombatStates = {}

local function GetState(player)
    if not CombatStates[player] then
        CombatStates[player] = {
            combo = 0,
            lastHit = 0,
            isBlocking = false,
            isStunned = false,
            stunEndTime = 0,
            stamina = Config.MAX_STAMINA,
        }
    end
    return CombatStates[player]
end

-- Clean up on player leave
Players.PlayerRemoving:Connect(function(player)
    CombatStates[player] = nil
end)

-- Process incoming hit request
HitEvent.OnServerEvent:Connect(function(attacker, targetChar, hitData)
    -- Anti-cheat validation
    if not AntiCheat.ValidateHit(attacker, hitData) then
        warn("[NEXUS] Blocked suspicious hit from: " .. attacker.Name)
        return
    end

    local state = GetState(attacker)
    local now = tick()

    -- Rate limiting: enforce swing cooldown
    if now - state.lastHit < Config.SWING_COOLDOWN then return end

    -- Check stamina
    if not StaminaModule.Consume(attacker, Config.STAMINA_PER_HIT) then
        -- Out of stamina — no hit
        return
    end

    -- Extend or reset combo
    if now - state.lastHit < Config.COMBO_WINDOW then
        state.combo = math.min(state.combo + 1, Config.MAX_COMBO)
    else
        state.combo = 1
    end
    state.lastHit = now

    -- Detect targets in hitbox
    local hits = HitboxUtil.GetHits(attacker.Character, hitData.range, hitData.angle)

    for _, victimChar in ipairs(hits) do
        local victim = Players:GetPlayerFromCharacter(victimChar)
        if not victim or victim == attacker then continue end

        local victimState = GetState(victim)

        -- Check block
        if victimState.isBlocking then
            local blockDrain = Config.BLOCK_STAMINA_DRAIN * (state.combo * 0.5)
            StaminaModule.Consume(victim, blockDrain)
            -- Blocked: reduced damage
            local blockedDmg = Config.BASE_DAMAGE * 0.1
            victimChar.Humanoid:TakeDamage(blockedDmg)
            HitEvent:FireClient(victim, { blocked = true, damage = blockedDmg })
            continue
        end

        -- Apply combo-scaled damage
        local damage = Config.BASE_DAMAGE * (1 + (state.combo - 1) * Config.COMBO_MULTIPLIER)

        -- Apply stun
        victimState.isStunned = true
        victimState.stunEndTime = now + Config.STUN_DURATION

        victimChar.Humanoid:TakeDamage(damage)

        -- Notify clients for animations / VFX
        HitEvent:FireAllClients({
            attacker = attacker,
            victim = victim,
            damage = damage,
            combo = state.combo,
            hitPos = hitData.hitPos,
        })
    end
end)

-- Blocking handler
BlockEvent.OnServerEvent:Connect(function(player, isBlocking)
    local state = GetState(player)
    if isBlocking and state.stamina < Config.BLOCK_MIN_STAMINA then return end
    state.isBlocking = isBlocking
end)

-- Stun expiry tick
RunService.Heartbeat:Connect(function()
    local now = tick()
    for player, state in pairs(CombatStates) do
        if state.isStunned and now >= state.stunEndTime then
            state.isStunned = false
        end
    end
end)`,

          "HitboxUtil.lua": `-- HitboxUtil.lua
-- Spatial hitbox detection using magnitude + dot-product angle check

local HitboxUtil = {}

-- Returns all valid enemy characters within range and angle
function HitboxUtil.GetHits(attackerChar, range, angleDeg)
    local root = attackerChar:FindFirstChild("HumanoidRootPart")
    if not root then return {} end

    local hits = {}
    local angleRad = math.rad(angleDeg / 2)

    for _, model in ipairs(workspace:GetChildren()) do
        if model == attackerChar then continue end
        local humanoid = model:FindFirstChildOfClass("Humanoid")
        local targetRoot = model:FindFirstChild("HumanoidRootPart")

        if not humanoid or humanoid.Health <= 0 then continue end
        if not targetRoot then continue end

        local toTarget = (targetRoot.Position - root.Position)
        local dist = toTarget.Magnitude

        if dist > range then continue end

        -- Dot product angle check
        local fwd = root.CFrame.LookVector
        local dot = fwd:Dot(toTarget.Unit)

        if dot >= math.cos(angleRad) then
            table.insert(hits, model)
        end
    end

    return hits
end

return HitboxUtil`,

          "StaminaModule.lua": `-- StaminaModule.lua
-- Handles stamina consumption and regeneration

local RunService = game:GetService("RunService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(script.Parent.Config)
local StaminaUpdate = ReplicatedStorage.Remotes:WaitForChild("StaminaUpdate")

local Staminas = {}

local StaminaModule = {}

function StaminaModule.Get(player)
    Staminas[player] = Staminas[player] or Config.MAX_STAMINA
    return Staminas[player]
end

function StaminaModule.Consume(player, amount)
    local current = StaminaModule.Get(player)
    if current < amount then return false end
    Staminas[player] = current - amount
    StaminaUpdate:FireClient(player, Staminas[player])
    return true
end

-- Regen loop
RunService.Heartbeat:Connect(function(dt)
    for player, stamina in pairs(Staminas) do
        if stamina < Config.MAX_STAMINA then
            Staminas[player] = math.min(stamina + Config.STAMINA_REGEN * dt, Config.MAX_STAMINA)
            StaminaUpdate:FireClient(player, Staminas[player])
        end
    end
end)

Players.PlayerRemoving:Connect(function(p) Staminas[p] = nil end)

return StaminaModule`,

          "Config.lua": `-- Config.lua
-- Central configuration for NEXUS combat tuning

return {
    BASE_DAMAGE       = 18,
    MAX_COMBO         = 5,
    COMBO_MULTIPLIER  = 0.15,   -- +15% damage per combo hit
    COMBO_WINDOW      = 1.2,    -- seconds to continue combo
    SWING_COOLDOWN    = 0.35,   -- min seconds between hits
    STUN_DURATION     = 0.45,   -- seconds victim is stunned
    MAX_STAMINA       = 100,
    STAMINA_PER_HIT   = 8,
    STAMINA_REGEN     = 12,     -- per second
    BLOCK_STAMINA_DRAIN = 20,
    BLOCK_MIN_STAMINA = 10,
    HITBOX_RANGE      = 6,
    HITBOX_ANGLE      = 110,    -- degrees
}`,

          "AntiCheat.lua": `-- AntiCheat.lua
-- Server-side validation to block exploits

local Players = game:GetService("Players")
local AntiCheat = {}

local hitTimestamps = {}

-- Maximum hits allowed per second
local MAX_HPS = 4

function AntiCheat.ValidateHit(player, hitData)
    local now = tick()
    hitTimestamps[player] = hitTimestamps[player] or {}

    -- Clear old entries
    hitTimestamps[player] = table.move(
        hitTimestamps[player], 1,
        #hitTimestamps[player], 1, {}
    )
    for i = #hitTimestamps[player], 1, -1 do
        if now - hitTimestamps[player][i] > 1 then
            table.remove(hitTimestamps[player], i)
        end
    end

    -- Check rate
    if #hitTimestamps[player] >= MAX_HPS then
        return false
    end

    -- Validate hit position is plausible
    local char = player.Character
    if not char then return false end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return false end

    if hitData.hitPos then
        local dist = (root.Position - hitData.hitPos).Magnitude
        if dist > 20 then return false end  -- teleport hack
    end

    table.insert(hitTimestamps[player], now)
    return true
end

Players.PlayerRemoving:Connect(function(p) hitTimestamps[p] = nil end)

return AntiCheat`,
        }
      }
    }
  },

  tycoon: {
    name: "Neon City Tycoon",
    files: {
      "TycoonSystem": {
        type: "folder",
        children: {
          "TycoonCore.lua": `-- TycoonCore.lua
-- Core tycoon loop: income, purchases, saving, and prestige

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local TycoonData = DataStoreService:GetDataStore("TycoonData_v3")
local Config = require(script.Parent.TycoonConfig)
local BuildingManager = require(script.Parent.BuildingManager)
local PrestigeModule = require(script.Parent.PrestigeModule)

local PlayerTycoons = {}

-- Default save structure
local function DefaultData()
    return {
        cash = Config.START_CASH,
        income = 0,
        buildings = {},
        prestige = 0,
        prestigeMultiplier = 1,
        totalEarned = 0,
        playTime = 0,
    }
end

-- Load player data with retry logic
local function LoadData(player)
    local data
    local success, err = pcall(function()
        data = TycoonData:GetAsync(tostring(player.UserId))
    end)

    if not success then
        warn("[Tycoon] Load failed for " .. player.Name .. ": " .. tostring(err))
        data = DefaultData()
    end

    data = data or DefaultData()

    -- Migrate old saves
    for k, v in pairs(DefaultData()) do
        if data[k] == nil then data[k] = v end
    end

    PlayerTycoons[player] = data
    return data
end

-- Auto-save with retry
local function SaveData(player)
    local data = PlayerTycoons[player]
    if not data then return end

    for attempt = 1, 3 do
        local ok, err = pcall(function()
            TycoonData:SetAsync(tostring(player.UserId), data)
        end)
        if ok then return end
        warn("[Tycoon] Save attempt " .. attempt .. " failed: " .. tostring(err))
        task.wait(1)
    end
end

-- Income tick every second
local incomeAccum = 0
RunService.Heartbeat:Connect(function(dt)
    incomeAccum += dt
    if incomeAccum < 1 then return end
    incomeAccum = 0

    for player, data in pairs(PlayerTycoons) do
        local income = data.income * data.prestigeMultiplier
        data.cash += income
        data.totalEarned += income
    end
end)

-- Auto-save every 60 seconds
task.spawn(function()
    while true do
        task.wait(60)
        for player in pairs(PlayerTycoons) do
            SaveData(player)
        end
    end
end)

Players.PlayerAdded:Connect(function(player)
    local data = LoadData(player)
    BuildingManager.RestoreBuildings(player, data.buildings)
end)

Players.PlayerRemoving:Connect(function(player)
    SaveData(player)
    PlayerTycoons[player] = nil
end)

-- Purchase a building
local function PurchaseBuilding(player, buildingId)
    local data = PlayerTycoons[player]
    if not data then return false, "No data" end
    if data.buildings[buildingId] then return false, "Already owned" end

    local buildingDef = Config.BUILDINGS[buildingId]
    if not buildingDef then return false, "Invalid building" end

    local cost = buildingDef.cost * (data.prestige > 0 and 1 or 1)
    if data.cash < cost then return false, "Not enough cash" end

    data.cash -= cost
    data.buildings[buildingId] = true
    data.income += buildingDef.income

    BuildingManager.SpawnBuilding(player, buildingId)
    return true
end

return {
    GetData = function(p) return PlayerTycoons[p] end,
    Purchase = PurchaseBuilding,
    Prestige = function(p) return PrestigeModule.Prestige(p, PlayerTycoons[p]) end,
    Save = SaveData,
}`,

          "BuildingManager.lua": `-- BuildingManager.lua
-- Handles spawning, animating, and restoring tycoon buildings

local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BuildingTemplates = ReplicatedStorage:WaitForChild("BuildingTemplates")
local Config = require(script.Parent.TycoonConfig)

local BuildingManager = {}

-- Animate building dropping in from the sky
local function AnimateBuildingSpawn(model)
    local finalCFrames = {}
    for _, part in ipairs(model:GetDescendants()) do
        if part:IsA("BasePart") and not part.Anchored then
            finalCFrames[part] = part.CFrame
            part.CFrame = part.CFrame + Vector3.new(0, 60, 0)
        end
    end

    local tweenInfo = TweenInfo.new(0.6, Enum.EasingStyle.Bounce, Enum.EasingDirection.Out)
    for part, cframe in pairs(finalCFrames) do
        TweenService:Create(part, tweenInfo, { CFrame = cframe }):Play()
    end
end

function BuildingManager.SpawnBuilding(player, buildingId)
    local def = Config.BUILDINGS[buildingId]
    if not def then return end

    local template = BuildingTemplates:FindFirstChild(def.modelName)
    if not template then
        warn("[Tycoon] Missing template: " .. def.modelName)
        return
    end

    local tycoonFolder = workspace:FindFirstChild("Tycoons")
        and workspace.Tycoons:FindFirstChild(tostring(player.UserId))
    if not tycoonFolder then return end

    local model = template:Clone()
    model.Name = buildingId
    model.Parent = tycoonFolder
    AnimateBuildingSpawn(model)
end

function BuildingManager.RestoreBuildings(player, buildings)
    for buildingId in pairs(buildings) do
        BuildingManager.SpawnBuilding(player, buildingId)
    end
end

return BuildingManager`,

          "TycoonConfig.lua": `-- TycoonConfig.lua
-- All tunable values for the tycoon

return {
    START_CASH = 500,

    BUILDINGS = {
        factory_small = {
            modelName  = "SmallFactory",
            cost       = 200,
            income     = 5,
            label      = "Small Factory",
        },
        factory_medium = {
            modelName  = "MediumFactory",
            cost       = 1000,
            income     = 22,
            label      = "Medium Factory",
        },
        power_plant = {
            modelName  = "PowerPlant",
            cost       = 5000,
            income     = 80,
            label      = "Power Plant",
        },
        skyscraper = {
            modelName  = "Skyscraper",
            cost       = 25000,
            income     = 350,
            label      = "Skyscraper",
        },
        neon_hub = {
            modelName  = "NeonHub",
            cost       = 100000,
            income     = 1200,
            label      = "Neon Hub",
        },
    },

    PRESTIGE_THRESHOLD = 1_000_000,
    PRESTIGE_MULTIPLIER_BONUS = 0.25, -- +25% income per prestige
}`,
        }
      }
    }
  },

  inventory: {
    name: "Inventory System — UI/UX",
    files: {
      "InventorySystem": {
        type: "folder",
        children: {
          "InventoryClient.lua": `-- InventoryClient.lua
-- Client-side inventory UI: drag, drop, tooltips, sorting

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local InventoryGui = playerGui:WaitForChild("InventoryGui")
local ItemGrid = InventoryGui:WaitForChild("Frame"):WaitForChild("Grid")
local Tooltip = InventoryGui:WaitForChild("Tooltip")

local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local GetInventory = Remotes:WaitForChild("GetInventory")
local EquipItem = Remotes:WaitForChild("EquipItem")
local DropItem = Remotes:WaitForChild("DropItem")

local SLOT_SIZE = 72
local SLOT_PADDING = 8
local RARITY_COLORS = {
    Common    = Color3.fromRGB(180, 180, 180),
    Uncommon  = Color3.fromRGB(78, 204, 78),
    Rare      = Color3.fromRGB(78, 138, 255),
    Epic      = Color3.fromRGB(168, 85, 247),
    Legendary = Color3.fromRGB(255, 170, 0),
}

local dragging = nil
local dragOffset = Vector2.new()
local itemSlots = {}

-- Build UI slot for an item
local function CreateSlot(itemData, index)
    local slot = Instance.new("Frame")
    slot.Name = "Slot_" .. index
    slot.Size = UDim2.fromOffset(SLOT_SIZE, SLOT_SIZE)
    slot.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
    slot.BorderSizePixel = 0

    local corner = Instance.new("UICorner", slot)
    corner.CornerRadius = UDim.new(0, 8)

    -- Rarity border
    local stroke = Instance.new("UIStroke", slot)
    stroke.Color = RARITY_COLORS[itemData.rarity] or RARITY_COLORS.Common
    stroke.Thickness = 2

    -- Item icon
    local icon = Instance.new("ImageLabel", slot)
    icon.Size = UDim2.new(0.75, 0, 0.75, 0)
    icon.AnchorPoint = Vector2.new(0.5, 0.5)
    icon.Position = UDim2.new(0.5, 0, 0.45, 0)
    icon.BackgroundTransparency = 1
    icon.Image = itemData.iconId or "rbxassetid://0"

    -- Stack count
    if (itemData.stack or 1) > 1 then
        local count = Instance.new("TextLabel", slot)
        count.Size = UDim2.new(1, -4, 0, 16)
        count.Position = UDim2.new(0, 2, 1, -18)
        count.BackgroundTransparency = 1
        count.TextColor3 = Color3.new(1,1,1)
        count.TextSize = 11
        count.Font = Enum.Font.GothamBold
        count.Text = "x" .. itemData.stack
        count.TextXAlignment = Enum.TextXAlignment.Right
    end

    -- Hover for tooltip
    slot.MouseEnter:Connect(function()
        ShowTooltip(itemData, slot)
    end)
    slot.MouseLeave:Connect(function()
        HideTooltip()
    end)

    -- Drag logic
    local dragConn
    slot.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = { item = itemData, slot = slot }
            dragOffset = Vector2.new(SLOT_SIZE/2, SLOT_SIZE/2)
            slot.BackgroundTransparency = 0.5
        end
    end)

    slot.Parent = ItemGrid
    itemSlots[index] = slot
    return slot
end

function ShowTooltip(item, slot)
    Tooltip.Visible = true
    Tooltip.Title.Text = item.name
    Tooltip.Rarity.Text = item.rarity
    Tooltip.Rarity.TextColor3 = RARITY_COLORS[item.rarity] or RARITY_COLORS.Common
    Tooltip.Description.Text = item.description or ""

    -- Fade in
    Tooltip.GroupTransparency = 1
    TweenService:Create(Tooltip, TweenInfo.new(0.15), {GroupTransparency = 0}):Play()
end

function HideTooltip()
    TweenService:Create(Tooltip, TweenInfo.new(0.1), {GroupTransparency = 1}):Play()
end

-- Drop detection
UserInputService.InputEnded:Connect(function(input)
    if input.UserInputType ~= Enum.UserInputType.MouseButton1 then return end
    if not dragging then return end

    -- Find target slot under mouse
    local pos = UserInputService:GetMouseLocation()
    for i, s in ipairs(itemSlots) do
        local abs = s.AbsolutePosition
        local sz  = s.AbsoluteSize
        if pos.X >= abs.X and pos.X <= abs.X+sz.X and pos.Y >= abs.Y and pos.Y <= abs.Y+sz.Y then
            -- Swap items
            EquipItem:FireServer(dragging.item.id, i)
            break
        end
    end

    dragging.slot.BackgroundTransparency = 0
    dragging = nil
end)

-- Load inventory from server
local function RefreshInventory()
    local items = GetInventory:InvokeServer()
    for _, child in ipairs(ItemGrid:GetChildren()) do
        if child:IsA("Frame") then child:Destroy() end
    end
    itemSlots = {}
    for i, item in ipairs(items) do
        CreateSlot(item, i)
    end
end

RefreshInventory()
GetInventory.OnClientEvent:Connect(RefreshInventory)`,

          "InventoryServer.lua": `-- InventoryServer.lua
-- Server-side inventory management and item validation

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local InventoryStore = DataStoreService:GetDataStore("Inventory_v2")
local Remotes = ReplicatedStorage:WaitForChild("Remotes")
local GetInventory = Remotes:WaitForChild("GetInventory")
local EquipItem = Remotes:WaitForChild("EquipItem")
local DropItem = Remotes:WaitForChild("DropItem")

local Inventories = {}
local MAX_SLOTS = 36

local function LoadInventory(player)
    local ok, data = pcall(function()
        return InventoryStore:GetAsync(tostring(player.UserId))
    end)
    Inventories[player] = (ok and data) or { items = {}, equipped = {} }
end

GetInventory.OnServerInvoke = function(player)
    return Inventories[player] and Inventories[player].items or {}
end

EquipItem.OnServerEvent:Connect(function(player, itemId, targetSlot)
    local inv = Inventories[player]
    if not inv then return end
    if targetSlot < 1 or targetSlot > MAX_SLOTS then return end

    -- Find the item
    for i, item in ipairs(inv.items) do
        if item.id == itemId then
            inv.equipped[1] = item
            GetInventory:FireClient(player)  -- refresh UI
            return
        end
    end
end)

Players.PlayerAdded:Connect(LoadInventory)
Players.PlayerRemoving:Connect(function(player)
    if Inventories[player] then
        pcall(function()
            InventoryStore:SetAsync(tostring(player.UserId), Inventories[player])
        end)
        Inventories[player] = nil
    end
end)`,
        }
      }
    }
  },

  admin: {
    name: "Admin Hub v3",
    files: {
      "AdminHub": {
        type: "folder",
        children: {
          "AdminCore.lua": `-- AdminCore.lua
-- Rank-based admin with command parsing, logging, and GUI

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local Config = require(script.Parent.AdminConfig)
local Logger = require(script.Parent.Logger)
local Commands = require(script.Parent.Commands)

local Remotes = ReplicatedStorage:WaitForChild("AdminRemotes")
local CmdRemote = Remotes:WaitForChild("RunCommand")

-- Check rank using group rank or manual override
local function GetAdminRank(player)
    if Config.OWNER_IDS[player.UserId] then return 5 end
    if Config.ADMIN_IDS[player.UserId] then return 3 end

    local ok, rank = pcall(function()
        return player:GetRankInGroup(Config.GROUP_ID)
    end)

    if ok then
        for rankThreshold, level in pairs(Config.GROUP_RANKS) do
            if rank >= rankThreshold then return level end
        end
    end

    return 0
end

-- Command execution pipeline
local function RunCommand(player, rawInput)
    local rank = GetAdminRank(player)
    if rank < 1 then return false, "No permission" end

    -- Parse: !kick player reason
    local parts = rawInput:split(" ")
    local cmdName = (parts[1] or ""):lower():gsub("^!", "")
    local args = {}
    for i = 2, #parts do table.insert(args, parts[i]) end

    local cmd = Commands[cmdName]
    if not cmd then return false, "Unknown command: " .. cmdName end

    if rank < cmd.requiredRank then
        return false, "Insufficient rank for: " .. cmdName
    end

    -- Resolve player targets (supports @all, @others, name partial)
    local targets = {}
    if args[1] == "@all" then
        targets = Players:GetPlayers()
    elseif args[1] == "@others" then
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= player then table.insert(targets, p) end
        end
    else
        for _, p in ipairs(Players:GetPlayers()) do
            if p.Name:lower():find(args[1]:lower()) then
                table.insert(targets, p)
                break
            end
        end
    end

    local reason = table.concat(args, " ", 2)
    local success, err = pcall(function()
        cmd.execute(player, targets, reason, args)
    end)

    -- Log the action
    Logger.Log({
        admin = player.Name,
        command = cmdName,
        targets = targets,
        reason = reason,
        success = success,
        timestamp = os.time(),
    })

    return success, err
end

CmdRemote.OnServerEvent:Connect(function(player, rawInput)
    local ok, msg = RunCommand(player, rawInput)
    CmdRemote:FireClient(player, ok, msg)
end)

return { GetRank = GetAdminRank }`,

          "Commands.lua": `-- Commands.lua
-- All admin commands registered here

local Players = game:GetService("Players")

local Commands = {}

Commands["kick"] = {
    requiredRank = 2,
    description = "Kick a player",
    usage = "!kick [player] [reason]",
    execute = function(admin, targets, reason)
        for _, target in ipairs(targets) do
            target:Kick("You were kicked by an admin. Reason: " .. (reason ~= "" and reason or "No reason given"))
        end
    end
}

Commands["ban"] = {
    requiredRank = 3,
    description = "Ban a player (persists via DataStore)",
    usage = "!ban [player] [reason]",
    execute = function(admin, targets, reason)
        local BanStore = game:GetService("DataStoreService"):GetDataStore("Bans_v1")
        for _, target in ipairs(targets) do
            pcall(function()
                BanStore:SetAsync(tostring(target.UserId), {
                    banned = true,
                    reason = reason,
                    bannedBy = admin.Name,
                    timestamp = os.time(),
                })
            end)
            target:Kick("You have been banned. Reason: " .. reason)
        end
    end
}

Commands["freeze"] = {
    requiredRank = 2,
    description = "Freeze a player in place",
    usage = "!freeze [player]",
    execute = function(_, targets)
        for _, target in ipairs(targets) do
            local char = target.Character
            if char then
                for _, part in ipairs(char:GetDescendants()) do
                    if part:IsA("BasePart") then part.Anchored = true end
                end
            end
        end
    end
}

Commands["speed"] = {
    requiredRank = 2,
    description = "Set player walkspeed",
    usage = "!speed [player] [value]",
    execute = function(_, targets, _, args)
        local val = tonumber(args[2]) or 16
        val = math.clamp(val, 0, 500)
        for _, target in ipairs(targets) do
            local hum = target.Character and target.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.WalkSpeed = val end
        end
    end
}

Commands["god"] = {
    requiredRank = 3,
    description = "Give a player godmode",
    usage = "!god [player]",
    execute = function(_, targets)
        for _, target in ipairs(targets) do
            local hum = target.Character and target.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.MaxHealth = math.huge; hum.Health = math.huge end
        end
    end
}

return Commands`,

          "Logger.lua": `-- Logger.lua
-- Stores and broadcasts admin action logs

local HttpService = game:GetService("HttpService")
local DataStoreService = game:GetService("DataStoreService")

local LogStore = DataStoreService:GetOrderedDataStore("AdminLogs_v1")
local MAX_LOGS = 200

local Logger = {}
local localLogs = {}

function Logger.Log(entry)
    entry.id = HttpService:GenerateGUID(false)
    table.insert(localLogs, 1, entry)

    -- Cap local log buffer
    if #localLogs > MAX_LOGS then
        table.remove(localLogs)
    end

    -- Persist to DataStore (non-blocking)
    task.spawn(function()
        pcall(function()
            LogStore:SetAsync(entry.id, entry)
        end)
    end)

    print(string.format("[ADMIN LOG] %s used !%s on %d player(s) — %s",
        entry.admin, entry.command, #entry.targets, entry.success and "OK" or "FAIL"))
end

function Logger.GetRecent(count)
    return { table.unpack(localLogs, 1, math.min(count or 20, #localLogs)) }
end

return Logger`,
        }
      }
    }
  },

  simulator: {
    name: "Clicks & Chaos — Simulator",
    files: {
      "SimulatorCore": {
        type: "folder",
        children: {
          "SimLoop.lua": `-- SimLoop.lua
-- Core simulator: click income, rebirths, leaderboard

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local SimStore = DataStoreService:GetDataStore("SimData_v4")
local Config = require(script.Parent.SimConfig)
local PetModule = require(script.Parent.PetModule)
local Rebirth = require(script.Parent.RebirthModule)

local PlayerData = {}

local function DefaultData()
    return {
        clicks = 0,
        rebirths = 0,
        rebirthMultiplier = 1,
        pets = {},
        totalClicks = 0,
        autoClickUnlocked = false,
    }
end

local function Load(player)
    local ok, data = pcall(function()
        return SimStore:GetAsync(tostring(player.UserId))
    end)
    data = (ok and data) or DefaultData()
    for k, v in pairs(DefaultData()) do
        if data[k] == nil then data[k] = v end
    end
    PlayerData[player] = data
    UpdateLeaderboard(player)
end

function UpdateLeaderboard(player)
    local data = PlayerData[player]
    if not data then return end

    local ls = player:FindFirstChild("leaderstats") or Instance.new("Folder", player)
    ls.Name = "leaderstats"

    local function Stat(name, val)
        local s = ls:FindFirstChild(name) or Instance.new("IntValue", ls)
        s.Name = name; s.Value = val
    end

    Stat("Clicks", data.clicks)
    Stat("Rebirths", data.rebirths)
end

-- Auto-click tick
local autoAccum = 0
RunService.Heartbeat:Connect(function(dt)
    autoAccum += dt
    if autoAccum < 1 then return end
    autoAccum = 0

    for player, data in pairs(PlayerData) do
        if data.autoClickUnlocked then
            local petBonus = PetModule.GetBonus(player, data.pets)
            local gained = math.floor(Config.AUTO_CPS * data.rebirthMultiplier * petBonus)
            data.clicks += gained
            data.totalClicks += gained
            UpdateLeaderboard(player)
        end
    end
end)

-- Click remote
local ClickRemote = game:GetService("ReplicatedStorage"):WaitForChild("SimRemotes"):WaitForChild("Click")
ClickRemote.OnServerEvent:Connect(function(player)
    local data = PlayerData[player]
    if not data then return end

    local petBonus = PetModule.GetBonus(player, data.pets)
    local gained = math.floor(Config.CLICK_VALUE * data.rebirthMultiplier * petBonus)

    data.clicks += gained
    data.totalClicks += gained
    UpdateLeaderboard(player)
end)

-- Save every 30s
task.spawn(function()
    while true do
        task.wait(30)
        for player, data in pairs(PlayerData) do
            pcall(function()
                SimStore:SetAsync(tostring(player.UserId), data)
            end)
        end
    end
end)

Players.PlayerAdded:Connect(Load)
Players.PlayerRemoving:Connect(function(p)
    if PlayerData[p] then
        pcall(function() SimStore:SetAsync(tostring(p.UserId), PlayerData[p]) end)
        PlayerData[p] = nil
    end
end)

return { GetData = function(p) return PlayerData[p] end }`,

          "PetModule.lua": `-- PetModule.lua
-- Pet equip, bonuses, and rarity rolling

local PetModule = {}

local RARITY_WEIGHTS = {
    { rarity = "Common",    weight = 60, multiplier = 1.2 },
    { rarity = "Uncommon",  weight = 25, multiplier = 1.5 },
    { rarity = "Rare",      weight = 10, multiplier = 2.0 },
    { rarity = "Epic",      weight = 4,  multiplier = 3.5 },
    { rarity = "Legendary", weight = 1,  multiplier = 8.0 },
}

local TOTAL_WEIGHT = 0
for _, r in ipairs(RARITY_WEIGHTS) do TOTAL_WEIGHT += r.weight end

-- Roll a random pet rarity
function PetModule.RollRarity()
    local roll = math.random() * TOTAL_WEIGHT
    local cumulative = 0
    for _, r in ipairs(RARITY_WEIGHTS) do
        cumulative += r.weight
        if roll <= cumulative then return r end
    end
    return RARITY_WEIGHTS[1]
end

-- Get combined bonus from equipped pets (max 3)
function PetModule.GetBonus(player, equippedPets)
    local bonus = 1
    for _, pet in ipairs(equippedPets) do
        bonus *= (pet.multiplier or 1)
    end
    return bonus
end

-- Hatch a pet egg
function PetModule.Hatch(player, eggId)
    local rarity = PetModule.RollRarity()
    local pet = {
        id = game:GetService("HttpService"):GenerateGUID(false),
        eggId = eggId,
        rarity = rarity.rarity,
        multiplier = rarity.multiplier,
        hatchedAt = os.time(),
    }
    return pet
end

return PetModule`,

          "RebirthModule.lua": `-- RebirthModule.lua
-- Prestige/rebirth system with multiplier bonuses

local RebirthModule = {}

local Config = require(script.Parent.SimConfig)

function RebirthModule.CanRebirth(data)
    return data.clicks >= Config.REBIRTH_COST
end

function RebirthModule.DoRebirth(player, data)
    if not RebirthModule.CanRebirth(data) then
        return false, "Not enough clicks"
    end

    -- Reset clicks, keep pets and rebirths
    data.clicks = 0
    data.rebirths += 1
    data.rebirthMultiplier = 1 + (data.rebirths * Config.REBIRTH_MULTIPLIER_PER)

    -- Unlock auto-click at rebirth 3
    if data.rebirths >= 3 then
        data.autoClickUnlocked = true
    end

    return true
end

return RebirthModule`,

          "SimConfig.lua": `-- SimConfig.lua

return {
    CLICK_VALUE              = 1,
    AUTO_CPS                 = 5,      -- clicks per second when auto unlocked
    REBIRTH_COST             = 1_000_000,
    REBIRTH_MULTIPLIER_PER   = 0.5,    -- +50% per rebirth
    MAX_EQUIPPED_PETS        = 3,
}`,
        }
      }
    }
  },

  trading: {
    name: "Trading System",
    files: {
      "TradingSystem": {
        type: "folder",
        children: {
          "TradeManager.lua": `-- TradeManager.lua
-- Server-side peer-to-peer trade handler with full validation

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = ReplicatedStorage:WaitForChild("TradeRemotes")
local SendRequest   = Remotes:WaitForChild("SendRequest")
local RespondTrade  = Remotes:WaitForChild("RespondTrade")
local OfferItem     = Remotes:WaitForChild("OfferItem")
local ConfirmTrade  = Remotes:WaitForChild("ConfirmTrade")
local CancelTrade   = Remotes:WaitForChild("CancelTrade")

local InventoryModule = require(script.Parent.TradeInventory)

-- Active trade sessions
-- session = { playerA, playerB, offerA={}, offerB={}, confirmedA, confirmedB }
local Sessions = {}

local function GetSession(player)
    for _, s in pairs(Sessions) do
        if s.playerA == player or s.playerB == player then return s end
    end
    return nil
end

local function CancelSession(session, reason)
    if not session then return end
    CancelTrade:FireClient(session.playerA, reason)
    CancelTrade:FireClient(session.playerB, reason)
    Sessions[session] = nil
end

-- Validate that a player actually owns the offered items
local function ValidateOffer(player, offer)
    for _, item in ipairs(offer) do
        if not InventoryModule.HasItem(player, item.id) then
            return false, "You don't own: " .. item.name
        end
    end
    return true
end

-- Send trade request
SendRequest.OnServerEvent:Connect(function(sender, targetPlayer)
    if sender == targetPlayer then return end
    if GetSession(sender) then
        SendRequest:FireClient(sender, false, "You're already in a trade")
        return
    end
    if GetSession(targetPlayer) then
        SendRequest:FireClient(sender, false, targetPlayer.Name .. " is busy")
        return
    end

    -- Create pending session
    local session = {
        playerA = sender, playerB = targetPlayer,
        offerA = {}, offerB = {},
        confirmedA = false, confirmedB = false,
        pending = true,
    }
    Sessions[session] = session

    -- Notify target
    RespondTrade:FireClient(targetPlayer, sender, "request")
    SendRequest:FireClient(sender, true)
end)

-- Target accepts/declines
RespondTrade.OnServerEvent:Connect(function(player, accepted)
    local session = GetSession(player)
    if not session or not session.pending then return end
    if session.playerB ~= player then return end

    if not accepted then
        CancelSession(session, session.playerA.Name .. " declined the trade")
        return
    end

    session.pending = false
    RespondTrade:FireClient(session.playerA, player, "accepted")
    RespondTrade:FireClient(session.playerB, session.playerA, "accepted")
end)

-- Player adds/removes item from their offer
OfferItem.OnServerEvent:Connect(function(player, itemId, adding)
    local session = GetSession(player)
    if not session or session.pending then return end

    local isA = session.playerA == player
    local offer = isA and session.offerA or session.offerB
    local other = isA and session.playerB or session.playerA

    -- Reset confirmations when offer changes
    session.confirmedA = false
    session.confirmedB = false

    if adding then
        -- Check ownership
        local item = InventoryModule.GetItem(player, itemId)
        if not item then return end
        if #offer >= 8 then return end  -- max 8 items per side
        table.insert(offer, item)
    else
        for i, item in ipairs(offer) do
            if item.id == itemId then table.remove(offer, i); break end
        end
    end

    -- Sync both sides
    OfferItem:FireClient(session.playerA, session.offerA, session.offerB)
    OfferItem:FireClient(session.playerB, session.offerA, session.offerB)
end)

-- Player confirms the trade
ConfirmTrade.OnServerEvent:Connect(function(player)
    local session = GetSession(player)
    if not session or session.pending then return end

    if session.playerA == player then session.confirmedA = true
    elseif session.playerB == player then session.confirmedB = true
    end

    ConfirmTrade:FireClient(session.playerA, session.confirmedA, session.confirmedB)
    ConfirmTrade:FireClient(session.playerB, session.confirmedA, session.confirmedB)

    if not (session.confirmedA and session.confirmedB) then return end

    -- Final validation before swap
    local okA, errA = ValidateOffer(session.playerA, session.offerA)
    local okB, errB = ValidateOffer(session.playerB, session.offerB)

    if not okA or not okB then
        CancelSession(session, "Trade failed validation: " .. (errA or errB))
        return
    end

    -- Execute the swap
    InventoryModule.SwapItems(session.playerA, session.offerA, session.playerB, session.offerB)

    -- Notify success
    ConfirmTrade:FireClient(session.playerA, true, true, "complete")
    ConfirmTrade:FireClient(session.playerB, true, true, "complete")
    Sessions[session] = nil
end)

-- Cancel at any time
CancelTrade.OnServerEvent:Connect(function(player)
    CancelSession(GetSession(player), player.Name .. " cancelled the trade")
end)

Players.PlayerRemoving:Connect(function(player)
    CancelSession(GetSession(player), player.Name .. " left the game")
end)`,

          "TradeInventory.lua": `-- TradeInventory.lua
-- Item ownership helpers used by the trade manager

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local InvStore = DataStoreService:GetDataStore("Inventory_v2")
local Inventories = {}

local TradeInventory = {}

function TradeInventory.Load(player)
    local ok, data = pcall(function()
        return InvStore:GetAsync(tostring(player.UserId))
    end)
    Inventories[player] = (ok and data) or { items = {} }
end

function TradeInventory.HasItem(player, itemId)
    local inv = Inventories[player]
    if not inv then return false end
    for _, item in ipairs(inv.items) do
        if item.id == itemId then return true end
    end
    return false
end

function TradeInventory.GetItem(player, itemId)
    local inv = Inventories[player]
    if not inv then return nil end
    for _, item in ipairs(inv.items) do
        if item.id == itemId then return item end
    end
    return nil
end

-- Atomically swap items between two players
function TradeInventory.SwapItems(playerA, offerA, playerB, offerB)
    local invA = Inventories[playerA]
    local invB = Inventories[playerB]

    -- Remove offered items from each inventory
    for _, offered in ipairs(offerA) do
        for i, item in ipairs(invA.items) do
            if item.id == offered.id then table.remove(invA.items, i); break end
        end
        table.insert(invB.items, offered)
    end

    for _, offered in ipairs(offerB) do
        for i, item in ipairs(invB.items) do
            if item.id == offered.id then table.remove(invB.items, i); break end
        end
        table.insert(invA.items, offered)
    end

    -- Persist both inventories
    task.spawn(function()
        pcall(function() InvStore:SetAsync(tostring(playerA.UserId), invA) end)
        pcall(function() InvStore:SetAsync(tostring(playerB.UserId), invB) end)
    end)
end

Players.PlayerAdded:Connect(TradeInventory.Load)
Players.PlayerRemoving:Connect(function(p) Inventories[p] = nil end)

return TradeInventory`,
        }
      }
    }
  }
};

/* ============================================================
   MODAL RENDER ENGINE
   ============================================================ */

const modalOverlay = document.getElementById('modalOverlay');
const modal        = document.getElementById('modal');
const modalClose   = document.getElementById('modalClose');
const modalTitle   = document.getElementById('modalTitle');
const modalSidebar = document.getElementById('modalSidebar');
const modalBreadcrumb = document.getElementById('modalBreadcrumb');
const modalCodeView   = document.getElementById('modalCodeView');

let currentProject = null;
let activeFile = null;

function openModal(projectId) {
  currentProject = PROJECTS[projectId];
  if (!currentProject) return;

  modalTitle.textContent = currentProject.name;
  buildSidebar(currentProject.files);

  // Show root folder by default
  showFolderView(currentProject.files);

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  activeFile = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

// Build the sidebar tree
function buildSidebar(files, indent=0) {
  if(indent === 0) modalSidebar.innerHTML = '';

  for(const [name, entry] of Object.entries(files)) {
    if(entry.type === 'folder') {
      const folderEl = document.createElement('div');
      folderEl.className = 'sidebar-folder' + (indent ? ' sidebar-indent' : '');
      folderEl.innerHTML = `<span class="sidebar-folder-icon">📁</span> ${name}`;
      folderEl.addEventListener('click', () => showFolderView(entry.children, name));
      modalSidebar.appendChild(folderEl);
      buildSidebar(entry.children, indent+1);
    } else {
      // It's a file
      const fileEl = document.createElement('div');
      fileEl.className = 'sidebar-file' + (indent ? ' sidebar-indent' : '');
      const ext = name.endsWith('.lua') ? '📄' : '📝';
      fileEl.innerHTML = `<span>${ext}</span> ${name}`;
      fileEl.addEventListener('click', () => showFile(name, entry, fileEl));
      modalSidebar.appendChild(fileEl);
    }
  }
}

// Show folder overview
function showFolderView(children, folderName) {
  activeFile = null;
  document.querySelectorAll('.sidebar-file').forEach(el => el.classList.remove('active'));

  modalBreadcrumb.textContent = folderName ? `/ ${folderName}` : '/ root';

  const files = [];
  for(const [name, entry] of Object.entries(children)) {
    files.push({ name, entry });
  }

  modalCodeView.innerHTML = '';
  const fv = document.createElement('div');
  fv.className = 'folder-view';
  fv.innerHTML = `
    <div class="folder-view-title">${folderName || 'Project Root'}</div>
    <div class="folder-view-sub">${files.length} item${files.length!==1?'s':''} — click to open</div>
    <div class="folder-items" id="folderItemList"></div>
  `;
  modalCodeView.appendChild(fv);

  const list = document.getElementById('folderItemList');
  files.forEach(({name, entry}) => {
    const item = document.createElement('div');
    item.className = 'folder-item';
    const isFolder = entry.type === 'folder';
    item.innerHTML = `
      <span class="folder-item-icon">${isFolder ? '📁' : '📄'}</span>
      <div>
        <div class="folder-item-name">${name}</div>
        <div class="folder-item-desc">${isFolder ? Object.keys(entry.children).length + ' files' : 'Lua module'}</div>
      </div>
    `;
    if(isFolder) {
      item.addEventListener('click', () => showFolderView(entry.children, name));
    } else {
      item.addEventListener('click', () => {
        const sidebarFile = Array.from(document.querySelectorAll('.sidebar-file'))
          .find(el => el.textContent.trim().includes(name));
        showFile(name, entry, sidebarFile);
      });
    }
    list.appendChild(item);
  });
}

// Show file with syntax highlighting
function showFile(name, content, sidebarEl) {
  // Deactivate all sidebar items
  document.querySelectorAll('.sidebar-file').forEach(el => el.classList.remove('active'));
  if(sidebarEl) sidebarEl.classList.add('active');

  activeFile = name;
  modalBreadcrumb.textContent = `/ ${name}`;

  const source = typeof content === 'string' ? content : content;
  const lines = source.split('\n');

  modalCodeView.innerHTML = '';
  const block = document.createElement('div');
  block.className = 'code-block';

  lines.forEach((rawLine, i) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'code-line';

    const numEl = document.createElement('span');
    numEl.className = 'code-line-num';
    numEl.textContent = i + 1;

    const contentEl = document.createElement('span');
    contentEl.className = 'code-line-content';
    contentEl.innerHTML = highlightLua(rawLine);

    lineEl.appendChild(numEl);
    lineEl.appendChild(contentEl);
    block.appendChild(lineEl);
  });

  modalCodeView.appendChild(block);
  modalCodeView.scrollTop = 0;
}

// Basic Lua syntax highlighter
function highlightLua(line) {
  // Escape HTML first
  let s = line
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');

  // Comments (must be first)
  s = s.replace(/(--[^\n]*)$/, '<span class="cm">$1</span>');
  if(s.includes('class="cm"')) return s; // whole line is comment

  // Strings
  s = s.replace(/"([^"]*)"/g, '<span class="st">"$1"</span>');
  s = s.replace(/'([^']*)'/g, "<span class=\"st\">'$1'</span>");

  // Keywords
  const keywords = ['local','function','return','if','then','else','elseif','end','for','in','do','while','repeat','until','not','and','or','true','false','nil','break','continue','self'];
  keywords.forEach(kw => {
    s = s.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="kw">$1</span>');
  });

  // Built-in types / services
  const types = ['game','workspace','Players','RunService','TweenService','DataStoreService','ReplicatedStorage','HttpService','UserInputService','Instance','Vector3','CFrame','Color3','UDim2','UDim','Enum','math','table','string','task','pcall','warn','print','tostring','tonumber','pairs','ipairs','type','require','tick','os','coroutine'];
  types.forEach(tp => {
    s = s.replace(new RegExp(`\\b(${tp})\\b`, 'g'), '<span class="tp">$1</span>');
  });

  // Numbers
  s = s.replace(/\b(\d+[\d_]*(?:\.\d+)?(?:_\d+)*)\b/g, '<span class="nm">$1</span>');

  // Function calls
  s = s.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, (m, fn) => {
    if(['if','while','for','function','return'].includes(fn)) return m;
    return `<span class="fn">${fn}</span>(`;
  });

  return s;
}

// Wire up work cards
document.querySelectorAll('.work-card').forEach(card => {
  const btn = card.querySelector('.work-explore-btn');
  if(btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(card.dataset.project);
    });
  }
});
