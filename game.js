class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.name = "Equilibrado";
        this.size = 30;
        
        // Estadísticas base
        this.stats = {
            health: 100,
            maxHealth: 100,
            strength: 25,
            armor: 5,
            agility: 5,
            attackSpeed: 1,
            critChance: 5,
            critDamage: 150,
            healthRegen: 0.02,
            lifeSteal: 0,
            range: 115,
            moveSpeed: 5
        };

        // Valores calculados
        this.attackRange = this.stats.range;
        this.attackCooldown = 0;
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Sistema de progresión
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.evolutionLevel = 0;
        this.enemiesKilled = 0;
        this.evolutionThresholds = [15, 30, 60, 120, 240, 360];
        
        this.color = '#ffb6c1';
        this.eyesOpen = true;
        this.blinkTimer = 0;
        this.projectiles = [];
        this.pickupRange = 100;

        // Sistema de puntos de habilidad
        this.skillPoints = 0;
        
        // Sistema de evolución
        this.evolutionPoints = 0;
        this.evolvedParts = {
            head: false,
            torso: false,
            arms: false,
            hands: false,
            legs: false,
            feet: false
        };
        
        // Multiplicadores de evolución
        this.evolutionMultipliers = {
            health: 1,
            healthRegen: 1,
            strength: 1,
            attackSpeed: 1,
            critChance: 1,
            critDamage: 1,
            lifeSteal: 1,
            range: 1,
            moveSpeed: 1,
            agility: 1
        };

        // Sistema de enfriamiento de colisión
        this.collisionCooldown = 0;
        this.maxCollisionCooldown = 60; // 1 segundo (60 frames)
    }

    draw(ctx) {
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Cuerpo del cubo (rosa claro)
        ctx.fillStyle = '#FFB6C1';
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Borde del cubo
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos
        const eyeSize = this.size * 0.15;
        ctx.fillStyle = '#000';
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/6, this.size/4, 0, Math.PI);
        ctx.stroke();

        // Brazos
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 3;
        // Brazo izquierdo
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y);
        ctx.lineTo(this.x - this.size/2 - 10, this.y + 5);
        ctx.stroke();
        // Brazo derecho
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/2, this.y);
        ctx.lineTo(this.x + this.size/2 + 10, this.y + 5);
        ctx.stroke();

        // Dibujar proyectiles más visibles
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(255, 182, 193, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#FFC0CB');
            gradient.addColorStop(0.6, '#FFB6C1');
            gradient.addColorStop(1, '#FF69B4');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Dibujar proyectil principal
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();

            // Destellos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(proj.x - proj.size/3, proj.y - proj.size/3, proj.size/4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    move(dx, dy) {
        // Calcular nueva posición
        const newX = this.x + dx * this.stats.moveSpeed;
        const newY = this.y + dy * this.stats.moveSpeed;
        
        // Limitar movimiento dentro de los límites de la pantalla
        this.x = Math.max(this.size/2, Math.min(window.innerWidth - this.size/2, newX));
        this.y = Math.max(this.size/2, Math.min(window.innerHeight - this.size/2, newY));
    }

    attack(enemies) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        // Encontrar el enemigo más cercano
        let closestEnemy = null;
        let minDistance = this.attackRange;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.attackRange && (closestEnemy === null || distance < minDistance)) {
                closestEnemy = enemy;
                minDistance = distance;
            }
        });

        if (closestEnemy) {
            const dx = closestEnemy.x - this.x;
            const dy = closestEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Determinar si es crítico
            const isCritical = Math.random() * 100 < this.stats.critChance;
            const damage = this.stats.strength * (isCritical ? this.stats.critDamage / 100 : 1);
            
            // Crear proyectil
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * 5,
                dy: (dy / distance) * 5,
                size: 12,
                damage: damage,
                isCritical: isCritical
            });
            
            this.attackCooldown = this.maxAttackCooldown;
        }
    }

    takeDamage(damage) {
        // Calcular reducción de daño por armadura
        const damageReduction = this.stats.armor / (this.stats.armor + 100);
        const actualDamage = damage * (1 - damageReduction);
        
        // Calcular probabilidad de esquivar
        if (Math.random() * 100 < this.stats.agility) {
            game.addDamageNumber(this.x, this.y - this.size, 0, 'miss');
            return 0; // Daño esquivado
        }
        
        // Aplicar el daño a la vida actual
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        game.addDamageNumber(this.x, this.y - this.size, actualDamage, 'received');
        return actualDamage;
    }

    update() {
        // Regeneración de vida
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + this.stats.healthRegen);

        // Actualizar proyectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.dx;
            proj.y += proj.dy;
        });

        // Eliminar proyectiles fuera de pantalla
        this.projectiles = this.projectiles.filter(proj => 
            proj.x > 0 && proj.x < window.innerWidth &&
            proj.y > 0 && proj.y < window.innerHeight
        );
    }

    gainExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        
        // Otorgar punto de habilidad
        this.skillPoints++;
        
        // Ya no mejoramos las estadísticas automáticamente
        // Actualizar valores calculados
        this.attackRange = this.stats.range;
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
    }

    updateEvolution() {
        const previousLevel = this.evolutionLevel;
        for (let i = this.evolutionThresholds.length - 1; i >= 0; i--) {
            if (this.enemiesKilled >= this.evolutionThresholds[i]) {
                this.evolutionLevel = i + 1;
                break;
            }
        }
        // Otorgar punto de evolución si subió de nivel
        if (this.evolutionLevel > previousLevel) {
            this.evolutionPoints++;
        }
    }

    useSkillPoint(stat) {
        if (this.skillPoints <= 0) return false;
        
        switch(stat) {
            case 'health':
                this.stats.maxHealth += 8 * this.evolutionMultipliers.health;
                this.stats.health = this.stats.maxHealth;
                break;
            case 'strength':
                this.stats.strength += 1.5 * this.evolutionMultipliers.strength;
                break;
            case 'armor':
                this.stats.armor += 1.5;
                break;
            case 'agility':
                this.stats.agility += 0.8 * this.evolutionMultipliers.agility;
                break;
            case 'attackSpeed':
                this.stats.attackSpeed += 0.15 * this.evolutionMultipliers.attackSpeed;
                break;
            case 'critChance':
                this.stats.critChance += 1.5 * this.evolutionMultipliers.critChance;
                break;
            case 'critDamage':
                this.stats.critDamage += 8 * this.evolutionMultipliers.critDamage;
                break;
            case 'healthRegen':
                this.stats.healthRegen += 0.021 * this.evolutionMultipliers.healthRegen; // Reducido de 0.03 a 0.021 (30% menos)
                break;
            case 'lifeSteal':
                this.stats.lifeSteal += 0.8 * this.evolutionMultipliers.lifeSteal;
                break;
            case 'range':
                this.stats.range += 4 * this.evolutionMultipliers.range;
                break;
            case 'moveSpeed':
                this.stats.moveSpeed += 0.25 * this.evolutionMultipliers.moveSpeed;
                break;
            default:
                return false;
        }
        
        this.skillPoints--;
        // Actualizar valores calculados
        this.attackRange = this.stats.range;
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        return true;
    }

    evolve(part) {
        if (this.evolutionPoints <= 0 || this.evolvedParts[part]) return false;
        
        switch(part) {
            case 'head':
                this.evolutionMultipliers.critChance *= 1.5;
                this.evolutionMultipliers.critDamage *= 1.5;
                break;
            case 'torso':
                this.evolutionMultipliers.health *= 1.5;
                this.evolutionMultipliers.healthRegen *= 1.5;
                break;
            case 'arms':
                this.evolutionMultipliers.strength *= 1.5;
                this.evolutionMultipliers.attackSpeed *= 1.5;
                break;
            case 'hands':
                this.evolutionMultipliers.lifeSteal *= 1.5;
                this.evolutionMultipliers.critChance *= 1.5;
                break;
            case 'legs':
                this.evolutionMultipliers.moveSpeed *= 1.5;
                this.evolutionMultipliers.agility *= 1.5;
                break;
            case 'feet':
                this.evolutionMultipliers.range *= 1.5;
                this.evolutionMultipliers.moveSpeed *= 1.5;
                break;
            default:
                return false;
        }
        
        this.evolvedParts[part] = true;
        this.evolutionPoints--;
        return true;
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = type === 'circle' ? 30 : (type === 'triangle' ? 40 : (type === 'star' ? 50 : (type === 'octagon' ? 45 : (type === 'chest' ? 40 : (type === 'diamond' ? 55 : (type === 'finalBoss' ? 65 : 35))))));
        this.speed = type === 'pentagon' ? 1.5 : (type === 'star' ? 1 : (type === 'octagon' ? 3 : (type === 'diamond' ? 3.5 : (type === 'chest' ? 3 : (type === 'finalBoss' ? 4 : 2)))));
        this.health = type === 'circle' ? 50 : (type === 'triangle' ? 30 : (type === 'star' ? 1000 : (type === 'octagon' ? 150 : (type === 'diamond' ? 1100 : (type === 'chest' ? 200 : (type === 'finalBoss' ? 1650 : 25))))));
        this.maxHealth = this.health;
        this.color = type === 'circle' ? '#808080' : (type === 'triangle' ? '#4a235a' : (type === 'star' ? '#FFD700' : (type === 'octagon' ? '#8B4513' : (type === 'diamond' ? '#00CED1' : (type === 'chest' ? '#8B4513' : (type === 'finalBoss' ? '#ffb6c1' : '#2E7D32'))))));
        this.projectiles = [];
        this.legOffset = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.damage = type === 'circle' ? 25 : (type === 'triangle' ? 15 : (type === 'star' ? 34 : (type === 'octagon' ? 37.5 : (type === 'diamond' ? 37.4 : (type === 'chest' ? 25 : (type === 'finalBoss' ? 45 : 20))))));
        this.optimalRange = type === 'pentagon' ? 200 : (type === 'star' ? 300 : (type === 'octagon' ? 250 : (type === 'diamond' ? 350 : (type === 'finalBoss' ? 400 : 0))));
        this.shootProbability = type === 'pentagon' ? 0.01 : (type === 'triangle' ? 0.008 : (type === 'star' ? 0.02 : (type === 'diamond' ? 0.015 : (type === 'finalBoss' ? 0.025 : 0))));
        this.lastAttackPattern = 'straight';
        this.attackCooldown = 0;
        this.isCharging = false;
        this.chargeTarget = { x: 0, y: 0 };
        this.chargeCooldown = 0;
        this.lastTripleShot = 0;
        this.minionSpawnCooldown = 0;
        this.healthThresholds = type === 'finalBoss' ? [0.8, 0.6, 0.4, 0.2] : [];
        this.currentThresholdIndex = 0;

        // Sistema de enfriamiento de colisión
        this.collisionCooldown = 0;
        this.maxCollisionCooldown = 60; // 1 segundo (60 frames)
    }

    draw(ctx) {
        ctx.save();
        
        if (this.type === 'finalBoss') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo principal (rosa)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#ffb6c1');
            gradient.addColorStop(1, '#ff69b4');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Protuberancias superiores
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI / 2) - Math.PI / 4;
                const spikeX = this.x + Math.cos(angle) * this.size * 0.6;
                const spikeY = this.y - this.size * 0.6;
                
                ctx.beginPath();
                ctx.moveTo(spikeX, spikeY);
                ctx.lineTo(spikeX + this.size * 0.2, spikeY - this.size * 0.4);
                ctx.lineTo(spikeX - this.size * 0.2, spikeY - this.size * 0.4);
                ctx.closePath();
                ctx.fill();
            }

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.7)';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.4, this.y, this.size * 0.25, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.4, this.y, this.size * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#800000';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.1, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.3, this.y - this.size * 0.1, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3 + eyeSize/2, this.y - this.size * 0.1 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.3 + eyeSize/2, this.y - this.size * 0.1 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Expresión determinada
            ctx.strokeStyle = '#800000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size * 0.2, this.y + this.size * 0.2);
            ctx.lineTo(this.x + this.size * 0.2, this.y + this.size * 0.2);
            ctx.stroke();

            // Efecto de carga
            if (this.isCharging) {
                ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else if (this.type === 'chest') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del cofre (marrón)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(1, '#654321');
            
            // Base del cofre
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x - this.size/2, this.y - this.size/3, this.size, this.size/1.5);

            // Tapa del cofre
            ctx.beginPath();
            ctx.moveTo(this.x - this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x + this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x + this.size/2, this.y - this.size/1.5);
            ctx.lineTo(this.x - this.size/2, this.y - this.size/1.5);
            ctx.closePath();
            ctx.fill();

            // Detalles dorados
            ctx.fillStyle = '#FFD700';
            // Bisagras
            ctx.fillRect(this.x - this.size/2.2, this.y - this.size/3, this.size/10, this.size/5);
            ctx.fillRect(this.x + this.size/2.2 - this.size/10, this.y - this.size/3, this.size/10, this.size/5);
            
            // Cerradura
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size/4, this.size/8, 0, Math.PI * 2);
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, this.size/6, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, this.size/6, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.15;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Sonrisa kawaii
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/6, this.size/6, 0, Math.PI);
            ctx.stroke();

            // Pies
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y + this.size/3, this.size/6, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y + this.size/3, this.size/6, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'diamond') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del rombo con gradiente
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#00CED1');
            gradient.addColorStop(1, '#008B8B');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Dibujar rombo
            ctx.moveTo(this.x, this.y - this.size/2); // Punto superior
            ctx.lineTo(this.x + this.size/2, this.y); // Punto derecho
            ctx.lineTo(this.x, this.y + this.size/2); // Punto inferior
            ctx.lineTo(this.x - this.size/2, this.y); // Punto izquierdo
            ctx.closePath();
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Expresión determinada
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
            ctx.stroke();

            // Si está cargando, agregar efecto visual
            if (this.isCharging) {
                ctx.strokeStyle = 'rgba(0, 206, 209, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
                ctx.stroke();
            }

        } else if (this.type === 'octagon') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del octágono (marrón)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(1, '#654321');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Dibujar octágono
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI / 4) - Math.PI / 8;
                const x = this.x + this.size * Math.cos(angle);
                const y = this.y + this.size * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Expresión determinada
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
            ctx.stroke();

            // Cejas determinadas
            ctx.beginPath();
            ctx.moveTo(this.x - this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x - this.size/6, this.y - this.size/2);
            ctx.moveTo(this.x + this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x + this.size/6, this.y - this.size/2);
            ctx.stroke();

            // Si está cargando, agregar efecto visual
            if (this.isCharging) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
                ctx.stroke();
            }

        } else if (this.type === 'star') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo de la estrella (amarillo dorado)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Dibujar estrella de 5 puntas
            for (let i = 0; i < 10; i++) {
                const radius = i % 2 === 0 ? this.size : this.size * 0.4;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                const x = this.x + radius * Math.cos(angle);
                const y = this.y + radius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Sonrisa determinada
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
            ctx.stroke();

            // Uniforme militar
            ctx.fillStyle = '#4B5320'; // Verde militar
            ctx.beginPath();
            ctx.rect(this.x - this.size * 0.4, this.y + this.size * 0.2, this.size * 0.8, this.size * 0.4);
            ctx.fill();

            // Cinturón
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - this.size * 0.4, this.y + this.size * 0.4, this.size * 0.8, this.size * 0.1);

            // Insignias
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.2, this.y + this.size * 0.3, this.size * 0.05, 0, Math.PI * 2);
            ctx.arc(this.x + this.size * 0.2, this.y + this.size * 0.3, this.size * 0.05, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'pentagon') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del pentágono (verde suave y amigable)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // Dibujar pentágono
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const x = this.x + this.size * Math.cos(angle);
                const y = this.y + this.size * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#000000';
            // Ojos grandes y brillantes
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Boca kawaii (ceño fruncido enojado pero lindo)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, Math.PI, 0);
            ctx.stroke();

            // Cejas enojadas
            ctx.beginPath();
            ctx.moveTo(this.x - this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x - this.size/6, this.y - this.size/2);
            ctx.moveTo(this.x + this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x + this.size/6, this.y - this.size/2);
            ctx.stroke();

        } else if (this.type === 'circle') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del círculo (gris más claro y amigable)
            ctx.fillStyle = '#a0a0a0';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/2, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/2, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.25;
            ctx.fillStyle = '#000';
            // Ojos grandes y brillantes
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Sonrisa
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
            ctx.stroke();

        } else if (this.type === 'triangle') {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Cuerpo del triángulo (morado más claro y amigable)
            const gradient = ctx.createLinearGradient(
                this.x, this.y - this.size,
                this.x, this.y + this.size/2
            );
            gradient.addColorStop(0, '#9b59b6');
            gradient.addColorStop(1, '#8e44ad');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size, this.y + this.size/2);
            ctx.lineTo(this.x - this.size, this.y + this.size/2);
            ctx.closePath();
            ctx.fill();

            // Mejillas rosadas
            ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x - this.size/2, this.y, this.size/4, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/2, this.y, this.size/4, 0, Math.PI * 2);
            ctx.fill();

            // Ojos kawaii
            const eyeSize = this.size * 0.2;
            ctx.fillStyle = '#ff69b4';
            // Ojos grandes y brillantes
            ctx.beginPath();
            ctx.arc(this.x - this.size/3, this.y, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3, this.y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Brillos en los ojos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x - this.size/3 + eyeSize/2, this.y - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/3 + eyeSize/2, this.y - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
            ctx.fill();

            // Boca kawaii
            ctx.strokeStyle = '#ff69b4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size/4, this.size/6, 0, Math.PI);
            ctx.stroke();
        }
        
        ctx.restore();

        // Dibujar barra de vida
        const healthBarWidth = this.size;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - healthBarWidth/2, this.y - this.size/2 - 15, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - healthBarWidth/2, this.y - this.size/2 - 15, healthBarWidth * healthPercentage, healthBarHeight);
    }

    moveTowardsPlayer(player) {
        if (this.type === 'finalBoss') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.isCharging) {
                // Si está cargando, moverse rápidamente hacia el objetivo de carga
                const chargeDx = this.chargeTarget.x - this.x;
                const chargeDy = this.chargeTarget.y - this.y;
                const chargeDistance = Math.sqrt(chargeDx * chargeDx + chargeDy * chargeDy);
                
                if (chargeDistance < 5 || this.chargeTime >= 30) { // Detener la carga después de 0.5 segundos
                    // Si llegó al objetivo o terminó el tiempo, terminar la carga
                    this.isCharging = false;
                    this.chargeCooldown = 180; // 3 segundos de cooldown
                    this.chargeTime = 0;
                    this.speed = 4; // Restaurar velocidad normal
                } else {
                    // Incrementar el contador de tiempo de carga
                    this.chargeTime++;
                    
                    // Calcular nueva posición
                    let newX = this.x + (chargeDx / chargeDistance) * this.speed;
                    let newY = this.y + (chargeDy / chargeDistance) * this.speed;
                    
                    // Verificar colisión con otros enemigos
                    let canMove = true;
                    game.enemies.forEach(other => {
                        if (other !== this) {
                            const otherDx = newX - other.x;
                            const otherDy = newY - other.y;
                            const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                            
                            if (otherDistance < (this.size + other.size) * 0.8) {
                                canMove = false;
                            }
                        }
                    });
                    
                    // Mover solo si no hay colisión
                    if (canMove) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
            } else {
                if (this.chargeCooldown > 0) {
                    this.chargeCooldown--;
                }

                // Mantener distancia óptima cuando no está cargando
                const optimalDistance = this.optimalRange * 0.7;
                let moveSpeed = this.speed * 0.5;
                
                if (Math.abs(distance - optimalDistance) > 50) {
                    if (distance < optimalDistance) {
                        // Alejarse del jugador
                        this.x -= (dx / distance) * moveSpeed;
                        this.y -= (dy / distance) * moveSpeed;
                    } else {
                        // Acercarse al jugador
                        this.x += (dx / distance) * moveSpeed;
                        this.y += (dy / distance) * moveSpeed;
                    }
                }
            }
        } else if (this.type === 'chest') {
            // Movimiento aleatorio para el cofre
            const angle = Math.random() * Math.PI * 2;
            const speed = this.speed;
            
            // Calcular nueva posición
            let newX = this.x + Math.cos(angle) * speed;
            let newY = this.y + Math.sin(angle) * speed;
            
            // Verificar límites de la pantalla con margen
            const margin = 50;
            if (newX < margin) {
                newX = margin;
            } else if (newX > game.canvas.width - margin) {
                newX = game.canvas.width - margin;
            }
            
            if (newY < margin) {
                newY = margin;
            } else if (newY > game.canvas.height - margin) {
                newY = game.canvas.height - margin;
            }
            
            // Verificar colisión con otros enemigos antes de moverse
            let canMove = true;
            game.enemies.forEach(other => {
                if (other !== this) {
                    const otherDx = newX - other.x;
                    const otherDy = newY - other.y;
                    const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                    
                    if (otherDistance < (this.size + other.size) * 0.8) {
                        canMove = false;
                    }
                }
            });
            
            // Mover solo si no hay colisión
            if (canMove) {
                this.x = newX;
                this.y = newY;
            }
        } else if (this.type === 'diamond') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.isCharging) {
                // Si está cargando, moverse rápidamente hacia el objetivo de carga
                const chargeDx = this.chargeTarget.x - this.x;
                const chargeDy = this.chargeTarget.y - this.y;
                const chargeDistance = Math.sqrt(chargeDx * chargeDx + chargeDy * chargeDy);
                
                if (chargeDistance < 5) {
                    // Si llegó al objetivo, terminar la carga
                    this.isCharging = false;
                    this.chargeCooldown = 120; // 2 segundos de cooldown
                } else {
                    // Calcular nueva posición
                    let newX = this.x + (chargeDx / chargeDistance) * this.speed * 2;
                    let newY = this.y + (chargeDy / chargeDistance) * this.speed * 2;
                    
                    // Verificar colisión con otros enemigos
                    let canMove = true;
                    game.enemies.forEach(other => {
                        if (other !== this) {
                            const otherDx = newX - other.x;
                            const otherDy = newY - other.y;
                            const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                            
                            if (otherDistance < (this.size + other.size) * 0.8) {
                                canMove = false;
                            }
                        }
                    });
                    
                    // Mover solo si no hay colisión
                    if (canMove) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
            } else {
                if (this.chargeCooldown > 0) {
                    this.chargeCooldown--;
                }

                if (distance < this.optimalRange && this.chargeCooldown === 0) {
                    // Preparar la carga
                    this.isCharging = true;
                    this.chargeTarget = {
                        x: player.x,
                        y: player.y
                    };
                } else if (!this.isCharging) {
                    // Calcular nueva posición
                    let newX = this.x + (dx / distance) * this.speed * 0.5;
                    let newY = this.y + (dy / distance) * this.speed * 0.5;
                    
                    // Verificar colisión con otros enemigos
                    let canMove = true;
                    game.enemies.forEach(other => {
                        if (other !== this) {
                            const otherDx = newX - other.x;
                            const otherDy = newY - other.y;
                            const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                            
                            if (otherDistance < (this.size + other.size) * 0.8) {
                                canMove = false;
                            }
                        }
                    });
                    
                    // Mover solo si no hay colisión
                    if (canMove) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
            }
        } else if (this.type === 'octagon') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.isCharging) {
                // Si está cargando, moverse rápidamente hacia el objetivo de carga
                const chargeDx = this.chargeTarget.x - this.x;
                const chargeDy = this.chargeTarget.y - this.y;
                const chargeDistance = Math.sqrt(chargeDx * chargeDx + chargeDy * chargeDy);
                
                if (chargeDistance < 5) {
                    // Si llegó al objetivo, terminar la carga
                    this.isCharging = false;
                    this.chargeCooldown = 120; // 2 segundos de cooldown
                } else {
                    // Calcular nueva posición
                    let newX = this.x + (chargeDx / chargeDistance) * this.speed * 2;
                    let newY = this.y + (chargeDy / chargeDistance) * this.speed * 2;
                    
                    // Verificar colisión con otros enemigos
                    let canMove = true;
                    game.enemies.forEach(other => {
                        if (other !== this) {
                            const otherDx = newX - other.x;
                            const otherDy = newY - other.y;
                            const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                            
                            if (otherDistance < (this.size + other.size) * 0.8) {
                                canMove = false;
                            }
                        }
                    });
                    
                    // Mover solo si no hay colisión
                    if (canMove) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
            } else {
                if (this.chargeCooldown > 0) {
                    this.chargeCooldown--;
                }

                if (distance < this.optimalRange && this.chargeCooldown === 0) {
                    // Preparar la carga
                    this.isCharging = true;
                    this.chargeTarget = {
                        x: player.x,
                        y: player.y
                    };
                } else if (!this.isCharging) {
                    // Calcular nueva posición
                    let newX = this.x + (dx / distance) * this.speed * 0.5;
                    let newY = this.y + (dy / distance) * this.speed * 0.5;
                    
                    // Verificar colisión con otros enemigos
                    let canMove = true;
                    game.enemies.forEach(other => {
                        if (other !== this) {
                            const otherDx = newX - other.x;
                            const otherDy = newY - other.y;
                            const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                            
                            if (otherDistance < (this.size + other.size) * 0.8) {
                                canMove = false;
                            }
                        }
                    });
                    
                    // Mover solo si no hay colisión
                    if (canMove) {
                        this.x = newX;
                        this.y = newY;
                    }
                }
            }
        } else {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calcular nueva posición
            let newX, newY;
            
            // Comportamiento especial para el pentágono
            if (this.type === 'pentagon') {
                const direction = distance < this.optimalRange ? -1 : 1;
                const moveSpeed = direction === -1 ? this.speed * 1.5 : this.speed; // Más rápido al alejarse
                
                newX = this.x + (dx / distance) * moveSpeed * direction;
                newY = this.y + (dy / distance) * moveSpeed * direction;
            } else {
                newX = this.x + (dx / distance) * this.speed;
                newY = this.y + (dy / distance) * this.speed;
            }
            
            // Verificar colisión con otros enemigos
            let canMove = true;
            game.enemies.forEach(other => {
                if (other !== this) {
                    const otherDx = newX - other.x;
                    const otherDy = newY - other.y;
                    const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
                    
                    if (otherDistance < (this.size + other.size) * 0.8) {
                        canMove = false;
                        
                        // Calcular vector de repulsión
                        const repulsionForce = 0.5;
                        const repulsionX = (otherDx / otherDistance) * repulsionForce;
                        const repulsionY = (otherDy / otherDistance) * repulsionForce;
                        
                        // Aplicar repulsión a ambos enemigos
                        this.x += repulsionX;
                        this.y += repulsionY;
                        other.x -= repulsionX;
                        other.y -= repulsionY;
                    }
                }
            });
            
            // Mover solo si no hay colisión
            if (canMove) {
                this.x = newX;
                this.y = newY;
            }
        }

        // Mantener dentro de los límites de la pantalla
        this.x = Math.max(this.size, Math.min(game.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(game.canvas.height - this.size, this.y));
    }

    shoot(player) {
        if (this.type === 'finalBoss') {
            if (this.attackCooldown > 0) {
                this.attackCooldown--;
                return;
            }

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Ataque de carga
            if (distance < this.optimalRange && this.chargeCooldown === 0) {
                this.isCharging = true;
                // Calcular punto de carga que termine antes de llegar al jugador
                const chargeDistance = distance * 1.2; // 20% más allá de la distancia actual
                this.chargeTarget = {
                    x: this.x + (dx / distance) * chargeDistance,
                    y: this.y + (dy / distance) * chargeDistance
                };
                this.speed = this.speed * 2; // Velocidad durante la carga
                this.attackCooldown = 150; // 2.5 segundos de cooldown
                this.chargeTime = 0; // Reiniciar el contador de tiempo de carga
                return;
            }

            // Ataque triple secuencial
            if (!this.isCharging && this.lastTripleShot === 0) {
                const angle = Math.atan2(dy, dx);
                const projectileSpeed = 7; // Aumentada la velocidad de los proyectiles
                
                // Disparar 3 proyectiles en secuencia
                const fireProjectile = (delay, angleOffset) => {
                    setTimeout(() => {
                        const projectileAngle = angle + angleOffset;
                        this.projectiles.push({
                            x: this.x,
                            y: this.y,
                            dx: Math.cos(projectileAngle) * projectileSpeed,
                            dy: Math.sin(projectileAngle) * projectileSpeed,
                            size: 12,
                            type: this.type
                        });
                    }, delay);
                };

                // Disparar los proyectiles con un pequeño retraso entre cada uno
                fireProjectile(0, 0); // Primer proyectil directo
                fireProjectile(150, Math.PI / 12); // Segundo proyectil ligeramente desviado
                fireProjectile(300, -Math.PI / 12); // Tercer proyectil ligeramente desviado al otro lado

                this.lastTripleShot = 120; // 2 segundos de cooldown
                this.attackCooldown = 60; // 1 segundo de cooldown entre ataques
            }

            // Actualizar contadores
            if (this.lastTripleShot > 0) {
                this.lastTripleShot--;
            }
            if (this.minionSpawnCooldown > 0) {
                this.minionSpawnCooldown--;
            }
            
            // Restablecer velocidad después de la carga
            if (!this.isCharging && this.speed > 4) {
                this.speed = 4;
            }
            return;
        }
        
        if (this.type === 'diamond') {
            if (this.attackCooldown > 0) {
                this.attackCooldown--;
                return;
            }

            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.optimalRange && this.chargeCooldown === 0) {
                // Preparar la carga
                this.isCharging = true;
                this.chargeTarget = {
                    x: player.x,
                    y: player.y
                };
                this.attackCooldown = 90; // 1.5 segundos
                this.lastTripleShot = 0;
            } else if (!this.isCharging && this.lastTripleShot === 0) {
                // Disparar en 3 direcciones aleatorias
                const angles = [];
                for (let i = 0; i < 3; i++) {
                    angles.push(Math.random() * Math.PI * 2);
                }

                const projectileSpeed = 5;
                const projectileSize = 8;

                angles.forEach(angle => {
                    this.projectiles.push({
                        x: this.x,
                        y: this.y,
                        dx: Math.cos(angle) * projectileSpeed,
                        dy: Math.sin(angle) * projectileSpeed,
                        size: projectileSize,
                        type: this.type
                    });
                });

                this.lastTripleShot = 120; // 2 segundos de cooldown
                this.attackCooldown = 60; // 1 segundo
            }

            if (this.lastTripleShot > 0) {
                this.lastTripleShot--;
            }
            return;
        }

        if (this.type === 'star') {
            if (this.attackCooldown > 0) {
                this.attackCooldown--;
                return;
            }

            const projectileSpeed = 4;
            const projectileSize = 8;

            if (this.lastAttackPattern === 'straight') {
                // Disparar en las cuatro direcciones cardinales
                const directions = [
                    { dx: 1, dy: 0 },  // Este
                    { dx: -1, dy: 0 }, // Oeste
                    { dx: 0, dy: 1 },  // Sur
                    { dx: 0, dy: -1 }  // Norte
                ];

                directions.forEach(dir => {
                    this.projectiles.push({
                        x: this.x,
                        y: this.y,
                        dx: dir.dx * projectileSpeed,
                        dy: dir.dy * projectileSpeed,
                        size: projectileSize,
                        type: this.type
                    });
                });

                this.lastAttackPattern = 'diagonal';
                this.attackCooldown = 60; // Cooldown normal para el primer patrón
            } else {
                // Disparar en las cuatro diagonales
                const directions = [
                    { dx: 1, dy: 1 },   // Sureste
                    { dx: -1, dy: 1 },  // Suroeste
                    { dx: 1, dy: -1 },  // Noreste
                    { dx: -1, dy: -1 }  // Noroeste
                ];

                directions.forEach(dir => {
                    const magnitude = Math.sqrt(dir.dx * dir.dx + dir.dy * dir.dy);
                    this.projectiles.push({
                        x: this.x,
                        y: this.y,
                        dx: (dir.dx / magnitude) * projectileSpeed,
                        dy: (dir.dy / magnitude) * projectileSpeed,
                        size: projectileSize,
                        type: this.type
                    });
                });

                this.lastAttackPattern = 'straight';
                this.attackCooldown = 90; // Cooldown más largo para el segundo patrón (1.5 segundos)
            }
            return;
        }

        if ((this.type === 'triangle' || this.type === 'pentagon') && Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const projectileSpeed = this.type === 'pentagon' ? 6 : 5;
            const projectileSize = this.type === 'pentagon' ? 6 : 5;
            
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * projectileSpeed,
                dy: (dy / distance) * projectileSpeed,
                size: projectileSize,
                type: this.type
            });
        }
    }

    update() {
        // Actualizar proyectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.dx;
            proj.y += proj.dy;
        });

        // Eliminar proyectiles fuera de pantalla
        this.projectiles = this.projectiles.filter(proj => 
            proj.x > 0 && proj.x < game.canvas.width &&
            proj.y > 0 && proj.y < game.canvas.height
        );
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.state = 'menu';
        this.player = null;
        this.enemies = [];
        this.wave = 1;
        this.score = 0;
        this.showStats = false;
        this.showInstructions = false;
        this.devMode = false; // Variable para el modo desarrollador
        
        this.totalEnemiesForWave = 0;
        this.enemiesSpawned = 0;
        this.spawnInterval = null;
        
        this.keys = {};
        this.countdown = 3;
        this.countdownTimer = null;
        this.setupEventListeners();
        this.gameLoop();
        window.game = this;
        this.damageNumbers = [];
        this.hearts = [];
        this.particles = [];
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape' && this.state === 'playing') {
                this.state = 'paused';
            } else if (e.key === 'Escape' && this.state === 'paused') {
                this.state = 'playing';
            } else if (e.key === 'Escape' && this.devMode) {
                this.devMode = false;
            }
            // Manejo de teclas para modo desarrollador
            if (this.devMode) {
                if (e.key === 'ArrowUp') {
                    this.wave = Math.min(25, this.wave + 1);
                } else if (e.key === 'ArrowDown') {
                    this.wave = Math.max(1, this.wave - 1);
                } else if (e.key === 'Enter') {
                    this.startGame();
                }
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.state === 'menu') {
            // Botón de inicio
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, this.canvas.height/2, 200, 50)) {
                this.startGame();
            }
            // Botón de instrucciones
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, this.canvas.height/2 + 100, 200, 50)) {
                this.showInstructions = !this.showInstructions;
            }
            // Botón de modo desarrollador
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, this.canvas.height/2 + 200, 200, 50)) {
                this.devMode = !this.devMode;
                this.showInstructions = false;
            }
        } else if (this.state === 'paused') {
            const panelWidth = 1000;
            const panelHeight = 700;
            const panelX = (this.canvas.width - panelWidth) / 2;
            const panelY = (this.canvas.height - panelHeight) / 2;

            // Botón de continuar
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, panelY + panelHeight - 80, 200, 50)) {
                this.state = 'playing';
                return;
            }
            // Botón de volver al menú principal
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, panelY + panelHeight - 150, 200, 50)) {
                if (confirm('¿Estás seguro de que deseas volver al menú principal? Se perderá el progreso de la partida actual.')) {
                    this.state = 'menu';
                }
                return;
            }
        } else if (this.state === 'waveComplete') {
            const panelWidth = 1000;
            const panelHeight = 700;
            const panelX = (this.canvas.width - panelWidth) / 2;
            const panelY = (this.canvas.height - panelHeight) / 2;

            // Botón para comenzar siguiente oleada
            const nextWaveButtonX = this.canvas.width/2 - 100;
            const nextWaveButtonY = panelY + panelHeight - 80;
            
            if (x >= nextWaveButtonX && x <= nextWaveButtonX + 200 && 
                y >= nextWaveButtonY && y <= nextWaveButtonY + 50) {
                console.log('Iniciando siguiente oleada...');
                this.startNextWave();
                return;
            }

            // Verificar clics en botones de mejora de estadísticas
            if (this.player.skillPoints > 0) {
                const stats = [
                    null, // Nivel (no mejorable)
                    null, // Experiencia (no mejorable)
                    'health',
                    'strength',
                    'armor',
                    'agility',
                    'attackSpeed',
                    'critChance',
                    'critDamage',
                    'healthRegen',
                    'lifeSteal',
                    'range',
                    'moveSpeed'
                ];
                
                stats.forEach((stat, index) => {
                    if (stat) { // Solo procesar estadísticas mejorables
                        const buttonX = panelX + 350;
                        const buttonY = panelY + 140 + (index * 40) - 20;
                        
                        if (x >= buttonX && x <= buttonX + 35 &&
                            y >= buttonY && y <= buttonY + 30) {
                            this.showStatPreview(stat);
                        }
                    }
                });
            }

            // Verificar clics en botones de evolución
            if (this.player.evolutionPoints > 0) {
                const bodyParts = ['head', 'torso', 'arms', 'hands', 'legs', 'feet'];
                const rightPanelX = panelX + panelWidth/2 + 40;
                
                bodyParts.forEach((part, index) => {
                    if (!this.player.evolvedParts[part]) {
                        const buttonX = rightPanelX + 300;
                        const buttonY = panelY + 140 + index * 80 - 25;
                        
                        if (x >= buttonX && x <= buttonX + 120 &&
                            y >= buttonY && y <= buttonY + 35) {
                            this.showEvolutionPreview(part);
                        }
                    }
                });
            }
        } else if (this.state === 'gameOver') {
            // Botón de reinicio
            if (this.isPointInButton(x, y, this.canvas.width/2 - 100, this.canvas.height/2 + 200, 200, 50)) {
                this.state = 'menu';
            }
        }
    }

    isPointInButton(x, y, buttonX, buttonY, buttonWidth, buttonHeight) {
        return x >= buttonX && x <= buttonX + buttonWidth &&
               y >= buttonY && y <= buttonY + buttonHeight;
    }

    drawButton(x, y, width, height, text, isHovered = false) {
        this.ctx.fillStyle = isHovered ? '#4CAF50' : '#45a049';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
    }

    startGame() {
        this.state = 'playing';
        this.player = new Player(this.canvas.width/2, this.canvas.height/2);
        
        // Ajustar el nivel del jugador según la oleada seleccionada
        if (this.devMode) {
            // Calcular el nivel basado en la oleada (aproximadamente 0.5 niveles por oleada)
            const targetLevel = Math.floor(this.wave * 0.5) + 1;
            
            // Ajustar directamente el nivel y la experiencia
            this.player.level = targetLevel;
            this.player.experience = 0;
            this.player.experienceToNextLevel = 100;
            
            // Ajustar las estadísticas base según el nivel
            const baseStats = {
                health: 100,
                maxHealth: 100,
                strength: 25,
                armor: 5,
                agility: 5,
                attackSpeed: 1,
                critChance: 5,
                critDamage: 150,
                healthRegen: 0.02,
                lifeSteal: 0,
                range: 115,
                moveSpeed: 5
            };

            // Calcular multiplicadores basados en el nivel
            const levelMultiplier = 1 + (targetLevel - 1) * 0.1; // 10% de aumento por nivel
            
            // Aplicar multiplicadores a las estadísticas
            this.player.stats = {
                health: Math.floor(baseStats.health * levelMultiplier),
                maxHealth: Math.floor(baseStats.maxHealth * levelMultiplier),
                strength: Math.floor(baseStats.strength * levelMultiplier),
                armor: Math.floor(baseStats.armor * levelMultiplier),
                agility: Math.floor(baseStats.agility * levelMultiplier),
                attackSpeed: baseStats.attackSpeed * levelMultiplier,
                critChance: baseStats.critChance * levelMultiplier,
                critDamage: baseStats.critDamage * levelMultiplier,
                healthRegen: baseStats.healthRegen * levelMultiplier,
                lifeSteal: baseStats.lifeSteal * levelMultiplier,
                range: Math.floor(baseStats.range * levelMultiplier),
                moveSpeed: baseStats.moveSpeed * levelMultiplier
            };

            // Ajustar valores calculados
            this.player.attackRange = this.player.stats.range;
            this.player.attackCooldown = 0;
            this.player.maxAttackCooldown = 60 / this.player.stats.attackSpeed;
            
            // Ajustar la salud actual al máximo
            this.player.stats.health = this.player.stats.maxHealth;
        }
        
        this.enemies = [];
        this.wave = this.devMode ? this.wave : 1;
        this.score = 0;
        this.hearts = [];
        this.particles = [];
        this.startNextWave();
    }

    drawMenu() {
        // Fondo negro
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Título con efecto de brillo
        this.ctx.save();
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CUBICS', this.canvas.width/2, this.canvas.height/4);
        this.ctx.restore();

        // Subtítulo con animación
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Un juego de supervivencia geométrica', this.canvas.width/2, this.canvas.height/4 + 60);

        // Botones con efectos hover
        const buttonSpacing = 100;
        const buttonY = this.canvas.height/2;
        
        // Botón de inicio
        this.drawButton(this.canvas.width/2 - 100, buttonY, 200, 50, 'Iniciar Juego', true);
        
        // Botón de instrucciones
        this.drawButton(this.canvas.width/2 - 100, buttonY + buttonSpacing, 200, 50, 'Instrucciones', true);

        // Botón de modo desarrollador (temporal)
        this.drawButton(this.canvas.width/2 - 100, buttonY + buttonSpacing * 2, 200, 50, 'Modo Desarrollador', true);

        // Instrucciones con diseño mejorado
        if (this.showInstructions) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const instructionsPanel = {
                x: this.canvas.width/4,
                y: this.canvas.height/4,
                width: this.canvas.width/2,
                height: this.canvas.height/2
            };
            
            // Panel de instrucciones
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(instructionsPanel.x, instructionsPanel.y, instructionsPanel.width, instructionsPanel.height);
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(instructionsPanel.x, instructionsPanel.y, instructionsPanel.width, instructionsPanel.height);
            
            // Título de instrucciones
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Cómo Jugar', instructionsPanel.x + instructionsPanel.width/2, instructionsPanel.y + 50);
            
            // Contenido de instrucciones
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            const instructions = [
                'Controles:',
                '• Flechas del teclado para moverte',
                '• El personaje ataca automáticamente al acercarse a los enemigos',
                '',
                'Objetivo:',
                '• Sobrevive el mayor tiempo posible',
                '• Elimina enemigos para subir de nivel',
                '• Mejora tus estadísticas para volverte más fuerte',
                '',
                'Tipos de enemigos:',
                '• Círculos grises: Enemigos básicos',
                '• Triángulos morados: Lanzan proyectiles',
                '',
                'Presiona "Instrucciones" para cerrar'
            ];
            
            instructions.forEach((line, index) => {
                this.ctx.fillStyle = index === 0 || line === 'Objetivo:' || line === 'Tipos de enemigos:' ? '#4CAF50' : '#ffffff';
                this.ctx.fillText(line, instructionsPanel.x + 50, instructionsPanel.y + 100 + index * 30);
            });
        }

        // Panel de modo desarrollador
        if (this.devMode) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const devPanel = {
                x: this.canvas.width/4,
                y: this.canvas.height/4,
                width: this.canvas.width/2,
                height: this.canvas.height/2
            };
            
            // Panel de modo desarrollador
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(devPanel.x, devPanel.y, devPanel.width, devPanel.height);
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(devPanel.x, devPanel.y, devPanel.width, devPanel.height);
            
            // Título
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Modo Desarrollador', devPanel.x + devPanel.width/2, devPanel.y + 50);
            
            // Instrucciones
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            const instructions = [
                'Selecciona la oleada inicial:',
                '• Usa las flechas arriba/abajo para cambiar la oleada',
                '• Presiona Enter para confirmar',
                '• Presiona ESC para cancelar',
                '',
                `Oleada seleccionada: ${this.wave}`,
                '',
                'Presiona ESC para cerrar'
            ];
            
            instructions.forEach((line, index) => {
                this.ctx.fillText(line, devPanel.x + 50, devPanel.y + 120 + (index * 30));
            });
        }
    }

    drawStatsPanel(readOnly = false) {
        const panelWidth = 1000;
        const panelHeight = 700;
        const x = (this.canvas.width - panelWidth) / 2;
        const y = (this.canvas.height - panelHeight) / 2;

        // Fondo del panel con gradiente
        const panelGradient = this.ctx.createLinearGradient(x, y, x, y + panelHeight);
        panelGradient.addColorStop(0, 'rgba(26, 26, 46, 0.95)');
        panelGradient.addColorStop(1, 'rgba(22, 33, 62, 0.95)');
        this.ctx.fillStyle = panelGradient;
        this.ctx.fillRect(x, y, panelWidth, panelHeight);

        // Borde del panel con brillo
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Efecto de brillo en los bordes
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        this.ctx.shadowBlur = 0;

        // Títulos con efecto de brillo
        this.ctx.save();
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Estadísticas', x + panelWidth/4, y + 60);
        this.ctx.fillText('Evolución', x + (panelWidth * 3/4), y + 60);
        this.ctx.restore();

        // Panel izquierdo: Estadísticas y puntos de habilidad
        this.ctx.textAlign = 'left';
        this.ctx.font = '22px Arial';
        
        // Puntos de habilidad disponibles con icono
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`Puntos de Habilidad: ${this.player.skillPoints}`, x + 40, y + 100);
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 40, y + 110);
        this.ctx.lineTo(x + panelWidth/2 - 40, y + 110);
        this.ctx.stroke();

        // Lista de estadísticas con botones de mejora
        const stats = [
            { label: 'Nivel', value: this.player.level, stat: null },
            { label: 'Experiencia', value: `${this.player.experience}/${this.player.experienceToNextLevel}`, stat: null },
            { label: 'Vida', value: `${Math.floor(this.player.stats.health)}/${this.player.stats.maxHealth}`, stat: 'health', 
              improvement: `+${8 * this.player.evolutionMultipliers.health}` },
            { label: 'Fuerza', value: this.player.stats.strength, stat: 'strength',
              improvement: `+${1.5 * this.player.evolutionMultipliers.strength}` },
            { label: 'Armadura', value: this.player.stats.armor, stat: 'armor',
              improvement: `+${1.5}` },
            { label: 'Agilidad', value: `${this.player.stats.agility}%`, stat: 'agility',
              improvement: `+${0.8 * this.player.evolutionMultipliers.agility}%` },
            { label: 'Velocidad de Ataque', value: this.player.stats.attackSpeed.toFixed(1), stat: 'attackSpeed',
              improvement: `+${0.15 * this.player.evolutionMultipliers.attackSpeed}` },
            { label: 'Probabilidad de Crítico', value: `${this.player.stats.critChance}%`, stat: 'critChance',
              improvement: `+${1.5 * this.player.evolutionMultipliers.critChance}%` },
            { label: 'Daño Crítico', value: `${this.player.stats.critDamage}%`, stat: 'critDamage',
              improvement: `+${8 * this.player.evolutionMultipliers.critDamage}%` },
            { label: 'Regeneración de Vida', value: `${this.player.stats.healthRegen}/s`, stat: 'healthRegen',
              improvement: `+${0.05 * this.player.evolutionMultipliers.healthRegen}/s` },
            { label: 'Robo de Vida', value: `${this.player.stats.lifeSteal}%`, stat: 'lifeSteal',
              improvement: `+${0.8 * this.player.evolutionMultipliers.lifeSteal}%` },
            { label: 'Alcance', value: this.player.stats.range, stat: 'range',
              improvement: `+${4 * this.player.evolutionMultipliers.range}` },
            { label: 'Velocidad de Movimiento', value: this.player.stats.moveSpeed.toFixed(1), stat: 'moveSpeed',
              improvement: `+${0.25 * this.player.evolutionMultipliers.moveSpeed}` }
        ];

        stats.forEach((stat, index) => {
            const yPos = y + 140 + index * 40;
            
            // Estadística
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`${stat.label}: ${stat.value}`, x + 40, yPos);
            
            // Botón de mejora si la estadística puede mejorarse
            if (stat.stat && this.player.skillPoints > 0) {
                const buttonX = x + 350;
                const buttonY = yPos - 20;
                
                // Fondo del botón con gradiente
                const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX + 35, buttonY + 30);
                buttonGradient.addColorStop(0, '#4CAF50');
                buttonGradient.addColorStop(1, '#45a049');
                this.ctx.fillStyle = buttonGradient;
                this.ctx.fillRect(buttonX, buttonY, 35, 30);
                
                // Borde del botón
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(buttonX, buttonY, 35, 30);
                
                // Símbolo de mejora
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('+', buttonX + 17, buttonY + 22);
                
                // Texto de mejora
                this.ctx.font = '18px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText(stat.improvement, buttonX + 45, buttonY + 22);
            }
        });

        // Panel derecho: Sistema de evolución
        const rightPanelX = x + panelWidth/2 + 40;
        
        // Puntos de evolución disponibles
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`Puntos de Evolución: ${this.player.evolutionPoints}`, rightPanelX, y + 100);
        
        // Línea separadora
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(rightPanelX, y + 110);
        this.ctx.lineTo(x + panelWidth - 40, y + 110);
        this.ctx.stroke();
        
        // Partes del cuerpo y sus beneficios
        const bodyParts = [
            { name: 'Cabeza', benefits: '+50% mejoras de crítico', part: 'head', icon: '🧠' },
            { name: 'Torso', benefits: '+50% mejoras de vida y regeneración', part: 'torso', icon: '💪' },
            { name: 'Brazos', benefits: '+50% mejoras de fuerza y velocidad de ataque', part: 'arms', icon: '🦾' },
            { name: 'Manos', benefits: '+50% mejoras de robo de vida y crítico', part: 'hands', icon: '🤚' },
            { name: 'Piernas', benefits: '+50% mejoras de velocidad y agilidad', part: 'legs', icon: '🦵' },
            { name: 'Pies', benefits: '+50% mejoras de rango y velocidad', part: 'feet', icon: '🦶' }
        ];

        bodyParts.forEach((part, index) => {
            const yPos = y + 140 + index * 80;
            
            // Fondo de la tarjeta de evolución
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)';
            this.ctx.fillRect(rightPanelX - 10, yPos - 25, panelWidth/2 - 50, 70);
            
            // Icono
            this.ctx.font = '32px Arial';
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? '#4CAF50' : '#ffffff';
            this.ctx.fillText(part.icon, rightPanelX, yPos);
            
            // Nombre de la parte
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillStyle = this.player.evolvedParts[part.part] ? '#4CAF50' : '#ffffff';
            this.ctx.fillText(part.name, rightPanelX + 50, yPos);
            
            // Beneficios
            this.ctx.font = '18px Arial';
            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.fillText(part.benefits, rightPanelX + 50, yPos + 30);
            
            // Botón de evolución si está disponible
            if (!this.player.evolvedParts[part.part] && this.player.evolutionPoints > 0) {
                const buttonX = rightPanelX + 300;
                const buttonY = yPos - 25;
                const buttonWidth = 120;
                const buttonHeight = 35;
                
                // Fondo del botón con gradiente
                const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX + buttonWidth, buttonY + buttonHeight);
                buttonGradient.addColorStop(0, '#4CAF50');
                buttonGradient.addColorStop(1, '#45a049');
                this.ctx.fillStyle = buttonGradient;
                this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Borde del botón
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
                
                // Texto del botón
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Evolucionar', buttonX + buttonWidth/2, buttonY + 22);
                this.ctx.textAlign = 'left';
            }
        });

        // Botones de control
        if (readOnly) {
            // Botón de continuar
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 80, 200, 50, 'Continuar');
            // Botón de volver al menú principal
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 150, 200, 50, 'Volver al Menú Principal');
        } else {
            this.drawButton(this.canvas.width/2 - 100, y + panelHeight - 80, 200, 50, 'Siguiente Oleada');
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'menu') {
            this.drawMenu();
        } else if (this.state === 'playing') {
            // Dibujar jugador y enemigos
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => {
                enemy.draw(this.ctx);
                enemy.projectiles.forEach(proj => {
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            });

            // Dibujar partículas
            this.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            });

            // Panel de información del jugador (arriba)
            const barWidth = 200;
            const barHeight = 20;
            const barSpacing = 25;
            const panelX = 30;
            const panelY = 30;

            // Fondo del panel
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(panelX - 15, panelY - 15, (barWidth + barSpacing) * 3 + 30, barHeight + 30);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.strokeRect(panelX - 15, panelY - 15, (barWidth + barSpacing) * 3 + 30, barHeight + 30);

            // Barra de vida
            const healthGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(1, '#ff6666');
            this.drawHorizontalBar(panelX, panelY, barWidth, barHeight, 
                this.player.stats.health / this.player.stats.maxHealth, 
                healthGradient, `Vida: ${Math.floor(this.player.stats.health)}/${this.player.stats.maxHealth}`);

            // Barra de experiencia
            const expGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            expGradient.addColorStop(0, '#4CAF50');
            expGradient.addColorStop(1, '#8BC34A');
            this.drawHorizontalBar(panelX + barWidth + barSpacing, panelY, barWidth, barHeight,
                this.player.experience / this.player.experienceToNextLevel,
                expGradient, `Nivel ${this.player.level} - Exp: ${this.player.experience}/${this.player.experienceToNextLevel}`);

            // Barra de evolución
            const evoGradient = this.ctx.createLinearGradient(panelX, panelY, panelX + barWidth, panelY);
            evoGradient.addColorStop(0, '#2196F3');
            evoGradient.addColorStop(1, '#03A9F4');
            const evolutionProgress = this.player.enemiesKilled / 
                this.player.evolutionThresholds[Math.min(this.player.evolutionLevel, this.player.evolutionThresholds.length - 1)];
            this.drawHorizontalBar(panelX + (barWidth + barSpacing) * 2, panelY, barWidth, barHeight,
                evolutionProgress, evoGradient, `Evolución ${this.player.evolutionLevel} - Enemigos: ${this.player.enemiesKilled}`);

            // Panel de información de oleada (arriba a la derecha)
            const waveInfoX = this.canvas.width - 250;
            const waveInfoY = 30;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(waveInfoX - 15, waveInfoY - 15, 235, 110);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.strokeRect(waveInfoX - 15, waveInfoY - 15, 235, 110);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Oleada: ${this.wave}`, waveInfoX, waveInfoY + 20);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Enemigos: ${this.enemies.length}`, waveInfoX, waveInfoY + 50);
            this.ctx.fillText(`Puntuación: ${this.score}`, waveInfoX, waveInfoY + 80);

            // Indicador de pausa
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Presiona ESC para pausar', this.canvas.width/2, 30);

            // Dibujar corazones y cofres
            this.hearts.forEach(heart => {
                this.ctx.save();
                
                // Aplicar transformaciones para la animación
                this.ctx.translate(heart.x, heart.y);
                this.ctx.rotate(heart.rotation);
                this.ctx.scale(heart.scale, heart.scale);
                
                if (heart.isChest) {
                    // Sombra
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowOffsetY = 4;

                    // Base del cofre
                    const gradient = this.ctx.createLinearGradient(
                        -heart.size/2, -heart.size/2,
                        heart.size/2, heart.size/2
                    );
                    gradient.addColorStop(0, '#8B4513');
                    gradient.addColorStop(1, '#654321');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(-heart.size/2, -heart.size/3, heart.size, heart.size/1.5);
                    
                    // Tapa del cofre
                    this.ctx.beginPath();
                    this.ctx.moveTo(-heart.size/2, -heart.size/3);
                    this.ctx.lineTo(heart.size/2, -heart.size/3);
                    this.ctx.lineTo(heart.size/2, -heart.size/1.2);
                    this.ctx.lineTo(-heart.size/2, -heart.size/1.2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // Detalles dorados
                    this.ctx.fillStyle = '#FFD700';
                    // Bisagras
                    this.ctx.fillRect(-heart.size/2.2, -heart.size/3, heart.size/10, heart.size/5);
                    this.ctx.fillRect(heart.size/2.2 - heart.size/10, -heart.size/3, heart.size/10, heart.size/5);
                    
                    // Cerradura
                    this.ctx.beginPath();
                    this.ctx.arc(0, -heart.size/4, heart.size/6, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Detalles metálicos en las esquinas
                    this.ctx.fillStyle = '#DAA520';
                    const cornerSize = heart.size/8;
                    this.ctx.fillRect(-heart.size/2, -heart.size/3, cornerSize, cornerSize);
                    this.ctx.fillRect(heart.size/2 - cornerSize, -heart.size/3, cornerSize, cornerSize);
                    this.ctx.fillRect(-heart.size/2, heart.size/6 - cornerSize, cornerSize, cornerSize);
                    this.ctx.fillRect(heart.size/2 - cornerSize, heart.size/6 - cornerSize, cornerSize, cornerSize);
                    
                    // Efecto de brillo
                    const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, heart.size);
                    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
                    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.fillRect(-heart.size, -heart.size, heart.size * 2, heart.size * 2);
                } else {
                    // Sombra del corazón
                    this.ctx.shadowColor = 'rgba(255, 105, 180, 0.5)';
                    this.ctx.shadowBlur = 10;
                    
                    // Dibujar corazón
                    this.ctx.fillStyle = '#ff69b4';
                    this.ctx.beginPath();
                    const topCurveHeight = heart.size * 0.3;
                    
                    // Dibujar la forma del corazón
                    this.ctx.moveTo(0, heart.size/4);
                    
                    // Curva izquierda
                    this.ctx.bezierCurveTo(
                        -heart.size/2, 0, 
                        -heart.size/2, -topCurveHeight,
                        0, -heart.size/2
                    );
                    
                    // Curva derecha
                    this.ctx.bezierCurveTo(
                        heart.size/2, -topCurveHeight,
                        heart.size/2, 0,
                        0, heart.size/4
                    );
                    
                    this.ctx.fill();
                    
                    // Brillo
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(-heart.size/4, -heart.size/4, heart.size/6, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            });

            // Mostrar cuenta regresiva si está activa
            if (this.countdownTimer) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 72px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.countdown, this.canvas.width/2, this.canvas.height/2);
            }

            // Dibujar números de daño
            this.damageNumbers = this.damageNumbers.filter(number => {
                // Actualizar posición y opacidad
                number.offsetY -= 2;
                number.alpha -= 0.02;
                
                if (number.alpha <= 0) return false;

                this.ctx.save();
                this.ctx.globalAlpha = number.alpha;
                
                // Configurar estilo según el tipo
                if (number.type === 'miss') {
                    this.ctx.fillStyle = '#808080';
                    this.ctx.font = 'bold 24px Arial';
                    this.ctx.fillText('MISS', number.x, number.y + number.offsetY);
                } else {
                    // Configurar color según el tipo
                    this.ctx.fillStyle = number.color;
                    
                    // Efecto de sombra para mejor visibilidad
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.shadowBlur = 4;
                    
                    // Escalar el texto para críticos
                    this.ctx.font = `bold ${24 * number.scale}px Arial`;
                    this.ctx.textAlign = 'center';
                    
                    // Mostrar el número o texto
                    if (number.isText) {
                        this.ctx.fillText(number.damage, number.x, number.y + number.offsetY);
                    } else {
                        this.ctx.fillText(Math.round(number.damage), number.x, number.y + number.offsetY);
                    }
                }
                
                this.ctx.restore();
                return true;
            });
        } else if (this.state === 'paused') {
            // Dibujar el juego en pausa
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            
            // Dibujar panel de estadísticas (solo lectura)
            this.drawStatsPanel(true);
        } else if (this.state === 'waveComplete') {
            // Dibujar el juego
            this.player.draw(this.ctx);
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            
            // Dibujar panel de estadísticas con botón de siguiente oleada
            this.drawStatsPanel(false);
        } else if (this.state === 'gameOver') {
            // Fondo semitransparente
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Texto de Game Over
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
            
            // Estadísticas finales
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Puntuación final: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 40);
            this.ctx.fillText(`Nivel alcanzado: ${this.player.level}`, this.canvas.width/2, this.canvas.height/2 + 70);
            this.ctx.fillText(`Oleada: ${this.wave}`, this.canvas.width/2, this.canvas.height/2 + 100);
            
            // Mensaje especial si completó todas las oleadas
            if (this.wave > 25) {
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.font = 'bold 32px Arial';
                this.ctx.fillText('¡Felicidades! Has completado todas las oleadas', this.canvas.width/2, this.canvas.height/2 + 150);
            }
            
            // Botón de reinicio
            this.drawButton(this.canvas.width/2 - 100, this.canvas.height/2 + 200, 200, 50, 'Volver al Menú');
        }
    }

    drawHorizontalBar(x, y, width, height, fillPercentage, color, label) {
        // Sombra
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 5;
        
        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, width, height);
        
        // Barra de progreso
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width * Math.min(1, fillPercentage), height);
        
        // Resetear sombra
        this.ctx.shadowBlur = 0;
        
        // Borde
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // Etiqueta con sombra de texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText(label, x + 10, y + height/2 + 5);
        this.ctx.shadowBlur = 0;
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnEnemies() {
        // Calcular número total de enemigos para la oleada
        this.totalEnemiesForWave = Math.min(5 + this.wave * 2, 50);
        this.enemiesSpawned = 0;
        
        // Si es la oleada 10, 20 o 25, generar el jefe correspondiente
        if (this.wave === 10 || this.wave === 20 || this.wave === 25) {
            // Generar el jefe en el centro superior de la pantalla
            this.enemies.push(new Enemy(
                this.canvas.width / 2,
                -50,
                this.wave === 10 ? 'star' : (this.wave === 20 ? 'diamond' : 'finalBoss')
            ));
            this.enemiesSpawned = this.totalEnemiesForWave;
            return;
        }
        
        // Iniciar el spawner de enemigos
        this.spawnInterval = setInterval(() => {
            // No generar enemigos si el juego está pausado
            if (this.state !== 'playing' || this.countdownTimer) {
                return;
            }

            if (this.enemiesSpawned < this.totalEnemiesForWave) {
                // Determinar cuántos enemigos generar en este grupo
                let enemiesInGroup;
                const remainingEnemies = this.totalEnemiesForWave - this.enemiesSpawned;
                const random = Math.random();
                
                // 4% de probabilidad de generar un cofre
                if (random < 0.04) {
                    enemiesInGroup = 1;
                    const side = Math.floor(Math.random() * 4);
                    let x, y;
                    
                    switch(side) {
                        case 0: // Arriba
                            x = Math.random() * this.canvas.width;
                            y = -50;
                            break;
                        case 1: // Derecha
                            x = this.canvas.width + 50;
                            y = Math.random() * this.canvas.height;
                            break;
                        case 2: // Abajo
                            x = Math.random() * this.canvas.width;
                            y = this.canvas.height + 50;
                            break;
                        case 3: // Izquierda
                            x = -50;
                            y = Math.random() * this.canvas.height;
                            break;
                    }
                    
                    this.enemies.push(new Enemy(x, y, 'chest'));
                    this.enemiesSpawned++;
                } else {
                    if (random < 0.05 && remainingEnemies >= 4) { // 5% de probabilidad de 4 enemigos
                        enemiesInGroup = 4;
                    } else if (random < 0.15 && remainingEnemies >= 3) { // 10% de probabilidad de 3 enemigos
                        enemiesInGroup = 3;
                    } else if (random < 0.35 && remainingEnemies >= 2) { // 20% de probabilidad de 2 enemigos
                        enemiesInGroup = 2;
                    } else {
                        enemiesInGroup = 1;
                    }

                    // Determinar punto de aparición para el grupo
                    const side = Math.floor(Math.random() * 4);
                    let baseX, baseY;
                    
                    switch(side) {
                        case 0: // Arriba
                            baseX = Math.random() * this.canvas.width;
                            baseY = -50;
                            break;
                        case 1: // Derecha
                            baseX = this.canvas.width + 50;
                            baseY = Math.random() * this.canvas.height;
                            break;
                        case 2: // Abajo
                            baseX = Math.random() * this.canvas.width;
                            baseY = this.canvas.height + 50;
                            break;
                        case 3: // Izquierda
                            baseX = -50;
                            baseY = Math.random() * this.canvas.height;
                            break;
                    }

                    // Generar grupo de enemigos
                    for (let i = 0; i < enemiesInGroup; i++) {
                        // Determinar tipo de enemigo basado en la oleada actual
                        let type;
                        const typeRandom = Math.random();
                        
                        if (this.wave >= 7) {
                            if (typeRandom < 0.5) { // 50% círculos
                                type = 'circle';
                            } else if (typeRandom < 0.7) { // 20% triángulos
                                type = 'triangle';
                            } else if (typeRandom < 0.85) { // 15% pentágonos
                                type = 'pentagon';
                            } else { // 15% octágonos
                                type = 'octagon';
                            }
                        } else if (this.wave >= 5) {
                            if (typeRandom < 0.6) { // 60% círculos
                                type = 'circle';
                            } else if (typeRandom < 0.85) { // 25% triángulos
                                type = 'triangle';
                            } else { // 15% pentágonos
                                type = 'pentagon';
                            }
                        } else {
                            // Antes de la oleada 5, solo círculos y triángulos
                            type = typeRandom < 0.7 ? 'circle' : 'triangle';
                        }
                        
                        // Añadir variación a la posición dentro del grupo
                        const spread = 60; // Distancia máxima entre enemigos del grupo
                        const offsetX = (Math.random() - 0.5) * spread;
                        const offsetY = (Math.random() - 0.5) * spread;
                        
                        this.enemies.push(new Enemy(
                            baseX + offsetX,
                            baseY + offsetY,
                            type
                        ));
                        this.enemiesSpawned++;
                    }
                }
            } else {
                // Detener el spawner cuando se hayan generado todos los enemigos
                clearInterval(this.spawnInterval);
            }
        }, Math.max(3000 - (this.wave * 100), 1000));
    }

    startNextWave() {
        // Limpiar temporizadores existentes
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        
        // Limpiar enemigos y corazones
        this.enemies = [];
        this.hearts = [];
        
        // Cambiar estado a playing
        this.state = 'playing';
        this.countdown = 3;
        
        // Iniciar cuenta regresiva
        this.countdownTimer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
                clearInterval(this.countdownTimer);
                this.countdownTimer = null;
                // Iniciar generación gradual de enemigos
                this.spawnEnemies();
            }
        }, 1000);
    }

    update() {
        if (this.state === 'playing') {
            // Si hay una cuenta regresiva activa o el juego está pausado, no actualizar el juego
            if (this.countdownTimer || this.state === 'paused') {
                if (this.spawnInterval) {
                    clearInterval(this.spawnInterval);
                    this.spawnInterval = null;
                }
                return;
            }

            // Movimiento del jugador
            if (this.keys['ArrowLeft']) this.player.move(-1, 0);
            if (this.keys['ArrowRight']) this.player.move(1, 0);
            if (this.keys['ArrowUp']) this.player.move(0, -1);
            if (this.keys['ArrowDown']) this.player.move(0, 1);

            // Actualizar jugador
            this.player.update();

            // Actualizar enfriamiento de colisión del jugador
            if (this.player.collisionCooldown > 0) {
                this.player.collisionCooldown--;
            }

            // Ataque automático del jugador
            this.player.attack(this.enemies);

            // Actualizar proyectiles del jugador y verificar colisiones
            this.player.projectiles = this.player.projectiles.filter(proj => {
                let hit = false;
                
                // Verificar colisión con enemigos
                this.enemies.forEach(enemy => {
                    if (!hit) {
                        const dx = enemy.x - proj.x;
                        const dy = enemy.y - proj.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < (enemy.size + proj.size) / 2) {
                            enemy.health -= proj.damage;
                            // Mostrar el daño con el color apropiado
                            this.addDamageNumber(
                                enemy.x,
                                enemy.y - enemy.size,
                                proj.damage,
                                proj.isCritical ? 'crit' : 'normal'
                            );
                            hit = true;
                        }
                    }
                });
                
                return !hit && 
                    proj.x > 0 && proj.x < this.canvas.width &&
                    proj.y > 0 && proj.y < this.canvas.height;
            });

            // Actualizar enemigos y sus proyectiles
            this.enemies.forEach(enemy => {
                enemy.moveTowardsPlayer(this.player);
                enemy.update(); // Actualizar proyectiles
                enemy.shoot(this.player);

                // Actualizar enfriamiento de colisión del enemigo
                if (enemy.collisionCooldown > 0) {
                    enemy.collisionCooldown--;
                }
            });

            // Verificar colisiones con proyectiles enemigos
            this.enemies.forEach(enemy => {
                enemy.projectiles = enemy.projectiles.filter(proj => {
                    const dx = this.player.x - proj.x;
                    const dy = this.player.y - proj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < (this.player.size + proj.size) / 2) {
                        // El enemigo causa daño al jugador con el proyectil
                        this.player.takeDamage(enemy.damage);
                        return false;
                    }
                    
                    return true;
                });
            });

            // Verificar colisiones y muerte de enemigos
            this.enemies = this.enemies.filter(enemy => {
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (this.player.size + enemy.size) / 2) {
                    // Verificar enfriamiento de colisión
                    if (this.player.collisionCooldown === 0) {
                        // El enemigo causa daño al jugador por colisión
                        this.player.takeDamage(enemy.damage);
                        this.player.collisionCooldown = this.player.maxCollisionCooldown;
                    }
                    
                    if (enemy.collisionCooldown === 0) {
                        // El jugador causa daño al enemigo por colisión
                        enemy.health -= this.player.stats.strength;
                        // Mostrar el daño causado al enemigo
                        this.addDamageNumber(enemy.x, enemy.y - enemy.size, this.player.stats.strength, 'normal');
                        enemy.collisionCooldown = enemy.maxCollisionCooldown;
                    }
                }
                
                if (enemy.health <= 0) {
                    // Efecto especial para la muerte del jefe
                    if (enemy.type === 'star' || enemy.type === 'diamond' || enemy.type === 'finalBoss') {
                        // Crear explosión de partículas
                        this.createBossDeathEffect(enemy.x, enemy.y);
                        // Otorgar 5 puntos de habilidad
                        this.player.skillPoints += 5;
                        // Mostrar mensaje especial
                        if (enemy.type === 'finalBoss') {
                            this.addDamageNumber(enemy.x, enemy.y - 100, "Has salvado nuestro mundo....", 'boss');
                            setTimeout(() => {
                                this.addDamageNumber(enemy.x, enemy.y - 60, "Gracias....", 'boss');
                            }, 1500);
                        }
                        this.addDamageNumber(enemy.x, enemy.y - 30, '+5 Puntos de Habilidad', 'boss');
                        // Aumentar más la puntuación por derrotar al jefe
                        this.score += enemy.type === 'finalBoss' ? 2000 : 1000;
                    } else if (enemy.type === 'chest') {
                        // Crear un cofre del tesoro al morir
                        this.hearts.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: 20,
                            isChest: true,
                            rotation: 0,
                            scale: 1,
                            alpha: 1
                        });
                    }
                    
                    // 15% de probabilidad de soltar un corazón
                    if (Math.random() < 0.15) {
                        this.hearts.push({
                            x: enemy.x,
                            y: enemy.y,
                            size: 15
                        });
                    }
                    
                    this.player.enemiesKilled++;
                    this.player.gainExperience(20);
                    this.player.updateEvolution();
                    this.score += 100;
                    return false;
                }
                
                return true;
            });

            // Verificar si el jugador ha muerto
            if (this.player.stats.health <= 0) {
                this.state = 'gameOver';
            }

            // Verificar fin de oleada (modificado para tener en cuenta el spawn gradual)
            if (this.enemies.length === 0 && this.enemiesSpawned >= this.totalEnemiesForWave) {
                if (this.spawnInterval) {
                    clearInterval(this.spawnInterval);
                    this.spawnInterval = null;
                }
                this.wave++;
                if (this.wave > 25) {
                    this.state = 'gameOver';
                    return;
                }
                this.state = 'waveComplete';
                return;
            }

            // Actualizar partículas
            this.particles = this.particles.filter(particle => {
                particle.x += particle.dx;
                particle.y += particle.dy;
                particle.alpha -= particle.fadeSpeed;
                particle.size += particle.growthRate;
                return particle.alpha > 0;
            });

            // Actualizar corazones y cofres
            this.hearts = this.hearts.filter(heart => {
                if (heart.isChest) {
                    // Animación del cofre
                    heart.rotation = Math.sin(Date.now() / 500) * 0.1;
                    heart.scale = 1 + Math.sin(Date.now() / 300) * 0.1;
                    
                    // Si el jugador está cerca, recoger el cofre
                    const dx = this.player.x - heart.x;
                    const dy = this.player.y - heart.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.player.size) {
                        this.player.skillPoints++; // Dar un punto de habilidad
                        // Mostrar mensaje de +1 punto de habilidad
                        this.addDamageNumber(heart.x, heart.y - 30, '+1 Punto de Habilidad', 'skill');
                        // Crear efecto de partículas doradas
                        this.createChestCollectEffect(heart.x, heart.y);
                        return false;
                    }
                    return true;
                } else {
                    // Si el jugador está cerca y no tiene vida completa, mover el corazón hacia él
                    if (this.player.stats.health < this.player.stats.maxHealth) {
                        const dx = this.player.x - heart.x;
                        const dy = this.player.y - heart.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Si el corazón está dentro del rango de atracción, moverlo hacia el jugador
                        if (distance < this.player.pickupRange) {
                            // Calcular dirección hacia el jugador
                            const angle = Math.atan2(dy, dx);
                            const speed = 5; // Velocidad de atracción
                            heart.x += Math.cos(angle) * speed;
                            heart.y += Math.sin(angle) * speed;
                            
                            // Si el corazón está muy cerca del jugador, curarlo
                            if (distance < this.player.size) {
                                this.player.stats.health = Math.min(
                                    this.player.stats.maxHealth,
                                    this.player.stats.health + 10
                                );
                                return false;
                            }
                        }
                    }
                    return true;
                }
            });
        } else if (this.state === 'waveComplete') {
            // Atraer corazones y cofres hacia el jugador durante la pausa entre oleadas
            this.hearts = this.hearts.filter(heart => {
                const dx = this.player.x - heart.x;
                const dy = this.player.y - heart.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calcular dirección hacia el jugador
                const angle = Math.atan2(dy, dx);
                const speed = 8; // Velocidad de atracción más alta durante la pausa
                
                // Mover el corazón/cofre hacia el jugador
                heart.x += Math.cos(angle) * speed;
                heart.y += Math.sin(angle) * speed;
                
                // Si está cerca del jugador, procesar la recolección
                if (distance < this.player.size) {
                    if (heart.isChest) {
                        this.player.skillPoints++;
                        this.addDamageNumber(heart.x, heart.y - 30, '+1 Punto de Habilidad', 'skill');
                        this.createChestCollectEffect(heart.x, heart.y);
                    } else if (this.player.stats.health < this.player.stats.maxHealth) {
                        this.player.stats.health = Math.min(
                            this.player.stats.maxHealth,
                            this.player.stats.health + 10
                        );
                    }
                    return false;
                }
                return true;
            });
            return;
        }
    }

    showStatPreview(stat) {
        const oldValue = this.getStatValue(stat);
        const newValue = this.calculateNewStatValue(stat);
        
        // Crear ventana de confirmación
        const confirmWindow = document.createElement('div');
        confirmWindow.style.position = 'fixed';
        confirmWindow.style.top = '50%';
        confirmWindow.style.left = '50%';
        confirmWindow.style.transform = 'translate(-50%, -50%)';
        confirmWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        confirmWindow.style.padding = '20px';
        confirmWindow.style.border = '2px solid #4CAF50';
        confirmWindow.style.borderRadius = '10px';
        confirmWindow.style.color = 'white';
        confirmWindow.style.zIndex = '1000';
        
        confirmWindow.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Confirmar Mejora</h3>
            <p>Valor actual: ${oldValue}</p>
            <p>Nuevo valor: ${newValue}</p>
            <button onclick="game.confirmStatImprovement('${stat}')" style="margin: 10px; padding: 5px 15px;">Confirmar</button>
            <button onclick="game.cancelStatImprovement()" style="margin: 10px; padding: 5px 15px;">Cancelar</button>
        `;
        
        document.body.appendChild(confirmWindow);
    }

    showEvolutionPreview(part) {
        const confirmWindow = document.createElement('div');
        confirmWindow.style.position = 'fixed';
        confirmWindow.style.top = '50%';
        confirmWindow.style.left = '50%';
        confirmWindow.style.transform = 'translate(-50%, -50%)';
        confirmWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        confirmWindow.style.padding = '20px';
        confirmWindow.style.border = '2px solid #4CAF50';
        confirmWindow.style.borderRadius = '10px';
        confirmWindow.style.color = 'white';
        confirmWindow.style.zIndex = '1000';
        
        confirmWindow.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">Confirmar Evolución</h3>
            <p>¿Deseas evolucionar esta parte?</p>
            <button onclick="game.confirmEvolution('${part}')" style="margin: 10px; padding: 5px 15px;">Confirmar</button>
            <button onclick="game.cancelEvolution()" style="margin: 10px; padding: 5px 15px;">Cancelar</button>
        `;
        
        document.body.appendChild(confirmWindow);
    }

    getStatValue(stat) {
        return this.player.stats[stat];
    }

    calculateNewStatValue(stat) {
        const currentValue = this.getStatValue(stat);
        switch(stat) {
            case 'health':
                return currentValue + (8 * this.player.evolutionMultipliers.health);
            case 'strength':
                return currentValue + (1.5 * this.player.evolutionMultipliers.strength);
            case 'armor':
                return currentValue + 1.5;
            case 'agility':
                return currentValue + (0.8 * this.player.evolutionMultipliers.agility);
            case 'attackSpeed':
                return currentValue + (0.15 * this.player.evolutionMultipliers.attackSpeed);
            case 'critChance':
                return currentValue + (1.5 * this.player.evolutionMultipliers.critChance);
            case 'critDamage':
                return currentValue + (8 * this.player.evolutionMultipliers.critDamage);
            case 'healthRegen':
                return currentValue + (0.05 * this.player.evolutionMultipliers.healthRegen); // Reducido de 0.08 a 0.05
            case 'lifeSteal':
                return currentValue + (0.8 * this.player.evolutionMultipliers.lifeSteal);
            case 'range':
                return currentValue + (4 * this.player.evolutionMultipliers.range);
            case 'moveSpeed':
                return currentValue + (0.25 * this.player.evolutionMultipliers.moveSpeed);
            default:
                return currentValue;
        }
    }

    confirmStatImprovement(stat) {
        this.player.useSkillPoint(stat);
        this.removeConfirmWindow();
    }

    confirmEvolution(part) {
        this.player.evolve(part);
        this.removeConfirmWindow();
    }

    cancelStatImprovement() {
        this.removeConfirmWindow();
    }

    cancelEvolution() {
        this.removeConfirmWindow();
    }

    removeConfirmWindow() {
        const confirmWindow = document.querySelector('div[style*="z-index: 1000"]');
        if (confirmWindow) {
            confirmWindow.remove();
        }
    }

    addDamageNumber(x, y, damage, type = 'normal') {
        // type puede ser: 'normal' (blanco), 'received' (rojo), 'crit' (amarillo), 'miss' (gris), 'boss' (dorado), 'skill' (verde brillante)
        const scale = type === 'crit' ? 1.5 : (type === 'boss' ? 2.5 : (type === 'skill' ? 2 : 1));
        const color = type === 'boss' ? '#FFD700' : (
            type === 'normal' ? '#ffffff' :
            type === 'received' ? '#ff0000' :
            type === 'crit' ? '#ffd700' :
            type === 'skill' ? '#4CAF50' : '#808080'
        );
        
        this.damageNumbers.push({
            x: x,
            y: y,
            damage: damage,
            type: type,
            alpha: 1,
            offsetY: 0,
            scale: scale,
            color: color,
            isText: typeof damage === 'string'
        });
    }

    createBossDeathEffect(x, y) {
        // Crear explosión grande
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const speed = 2 + Math.random() * 3;
            const distance = 50 + Math.random() * 100;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 10 + Math.random() * 5,
                color: '#FFD700',
                alpha: 1,
                fadeSpeed: 0.02,
                growthRate: 0.1
            });
        }

        // Crear destellos
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 15,
                color: '#FFFFFF',
                alpha: 1,
                fadeSpeed: 0.01,
                growthRate: 0.2
            });
        }

        // Crear ondas expansivas
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: 0,
                dy: 0,
                size: 20,
                color: '#FFA500',
                alpha: 0.5,
                fadeSpeed: 0.01,
                growthRate: 2
            });
        }
    }

    createChestCollectEffect(x, y) {
        // Crear efecto de partículas doradas
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 3,
                color: '#FFD700',
                alpha: 1,
                fadeSpeed: 0.02,
                growthRate: 0.1
            });
        }
    }
}

// Iniciar el juego
window.onload = () => {
    new Game();
}; 