import Enemy from '../Enemy.js';

export default class FinalBossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'finalBoss',
            size: 65,
            speed: 4,
            health: 1650,
            color: '#ffb6c1',
            damage: 45,
            optimalRange: 400,
            shootProbability: 0.025
        });
        
        this.isCharging = false;
        this.chargeTarget = { x: 0, y: 0 };
        this.chargeCooldown = 0;
        this.minionSpawnCooldown = 0;
        this.healthThresholds = [0.8, 0.6, 0.4, 0.2];
        this.currentThresholdIndex = 0;
    }

    draw(ctx) {
        ctx.save();
        
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
        
        ctx.fillStyle = this.isBlinking ? '#ffffff' : gradient;
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
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    moveTowardsPlayer(player) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        // Actualizar cooldowns
        if (this.chargeCooldown > 0) {
            this.chargeCooldown--;
        }
        
        if (this.minionSpawnCooldown > 0) {
            this.minionSpawnCooldown--;
        }
        
        // Comprobar si se ha alcanzado un umbral de salud
        const healthPercentage = this.health / this.maxHealth;
        if (this.currentThresholdIndex < this.healthThresholds.length && 
            healthPercentage <= this.healthThresholds[this.currentThresholdIndex]) {
            this.currentThresholdIndex++;
            this.enragePhase();
        }
        
        // Si está cargando, moverse hacia el punto de carga
        if (this.isCharging) {
            const dx = this.chargeTarget.x - this.x;
            const dy = this.chargeTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si llega al punto objetivo o está cerca, terminar la carga
            if (distance < 10) {
                this.isCharging = false;
                this.chargeCooldown = 240; // 4 segundos de enfriamiento
            } else {
                // Mover hacia el punto objetivo a velocidad aumentada
                this.x += (dx / distance) * (this.speed * 2.5);
                this.y += (dy / distance) * (this.speed * 2.5);
            }
            return;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si puede cargar y está a la distancia adecuada, iniciar carga
        if (this.chargeCooldown === 0 && distance > 150 && distance < 500 && Math.random() < 0.015) {
            this.isCharging = true;
            this.chargeTarget = { x: player.x, y: player.y };
            return;
        }
        
        // Si hay un rango óptimo, mantener esa distancia
        if (this.optimalRange > 0 && distance < this.optimalRange) {
            this.x -= (dx / distance) * this.speed;
            this.y -= (dy / distance) * this.speed;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    shoot(player) {
        // Si está cargando, no disparar
        if (this.isCharging) {
            return;
        }
        
        if (Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Patrón de disparo triple en abanico
            const angle = Math.atan2(dy, dx);
            const spread = Math.PI / 12; // 15 grados
            
            for (let i = -1; i <= 1; i++) {
                const projectileAngle = angle + (i * spread);
                const projectileDx = Math.cos(projectileAngle) * 6;
                const projectileDy = Math.sin(projectileAngle) * 6;
                
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    dx: projectileDx,
                    dy: projectileDy,
                    size: 12,
                    damage: this.damage,
                    type: 'boss'
                });
            }
        }
    }
    
    // Método para la fase de furia
    enragePhase() {
        // Aumentar velocidad y daño según la fase
        this.speed += 0.5;
        this.damage += 5;
        this.shootProbability += 0.005;
        
        // Permitir invocar secuaces
        this.minionSpawnCooldown = 1; // Invocar inmediatamente
    }
    
    // Método para generar secuaces (será llamado desde Game.js)
    canSpawnMinions() {
        return this.minionSpawnCooldown === 0;
    }
    
    // Reiniciar el cooldown de generación de secuaces
    resetMinionSpawnCooldown() {
        this.minionSpawnCooldown = 600; // 10 segundos
    }
} 