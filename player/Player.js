export default class Player {
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
        if (typeof window !== 'undefined' && window.game && window.game.canvas) {
            this.x = Math.max(this.size/2, Math.min(window.game.canvas.width - this.size/2, newX));
            this.y = Math.max(this.size/2, Math.min(window.game.canvas.height - this.size/2, newY));
        } else {
            this.x = newX;
            this.y = newY;
        }
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
            return { damage: 0, type: 'miss' }; // Daño esquivado
        }
        
        // Aplicar el daño a la vida actual
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        return { damage: actualDamage, type: 'received' };
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
        this.projectiles = this.projectiles.filter(proj => {
            // Asegurarse de que game está definido
            if (typeof window !== 'undefined' && window.game && window.game.canvas) {
                return proj.x > 0 && proj.x < window.game.canvas.width &&
                       proj.y > 0 && proj.y < window.game.canvas.height;
            }
            return true; // Si no hay referencia al canvas, mantener el proyectil
        });
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