import Enemy from '../Enemy.js';

export default class DiamondEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'diamond',
            size: 55,
            speed: 3.5,
            health: 1100,
            color: '#00CED1',
            damage: 37.4,
            optimalRange: 350,
            shootProbability: 0.015
        });
        
        this.isCharging = false;
        this.chargeTarget = { x: 0, y: 0 };
        this.chargeCooldown = 0;
        this.lastTripleShot = 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Cuerpo de diamante con gradiente
        const gradient = ctx.createLinearGradient(
            this.x, this.y - this.size/2,
            this.x, this.y + this.size/2
        );
        gradient.addColorStop(0, '#00CED1');
        gradient.addColorStop(0.5, '#48D1CC');
        gradient.addColorStop(1, '#40E0D0');

        ctx.fillStyle = this.isBlinking ? '#ffffff' : gradient;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size/2); // Punta superior
        ctx.lineTo(this.x + this.size/2, this.y); // Punta derecha
        ctx.lineTo(this.x, this.y + this.size/2); // Punta inferior
        ctx.lineTo(this.x - this.size/2, this.y); // Punta izquierda
        ctx.closePath();
        ctx.fill();

        // Brillo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ojos kawaii
        const eyeSize = this.size * 0.1;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - this.size/6, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/6, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/6 + eyeSize/2, this.y - this.size/10 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/6 + eyeSize/2, this.y - this.size/10 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Boca kawaii
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/7, 0, Math.PI);
        ctx.stroke();

        // Mejillas rosadas
        ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y, this.size/10, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4, this.y, this.size/10, 0, Math.PI * 2);
        ctx.fill();

        // Efecto de carga
        if (this.isCharging) {
            ctx.strokeStyle = 'rgba(0, 206, 209, 0.6)';
            ctx.lineWidth = 3;
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
        
        // Si está cargando, moverse hacia el punto de carga
        if (this.isCharging) {
            const dx = this.chargeTarget.x - this.x;
            const dy = this.chargeTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si llega al punto objetivo o está cerca, terminar la carga
            if (distance < 10) {
                this.isCharging = false;
                this.chargeCooldown = 180; // 3 segundos de enfriamiento
            } else {
                // Mover hacia el punto objetivo a velocidad aumentada
                this.x += (dx / distance) * (this.speed * 2);
                this.y += (dy / distance) * (this.speed * 2);
            }
            return;
        }
        
        // Reducir cooldown de carga
        if (this.chargeCooldown > 0) {
            this.chargeCooldown--;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si puede cargar y está a la distancia adecuada, iniciar carga
        if (this.chargeCooldown === 0 && distance > 100 && distance < 400 && Math.random() < 0.01) {
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
        
        this.lastTripleShot++;
        
        // Cada 180 frames (3 segundos), disparar triple
        if (this.lastTripleShot >= 180 && Math.random() < this.shootProbability * 2) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            
            // Disparar en tres direcciones aleatorias
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const projectileDx = Math.cos(angle) * 6;
                const projectileDy = Math.sin(angle) * 6;
                
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    dx: projectileDx,
                    dy: projectileDy,
                    size: 10,
                    damage: this.damage,
                    type: 'diamond'
                });
            }
            
            this.lastTripleShot = 0;
        } 
        // Disparo normal
        else if (Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * 5,
                dy: (dy / distance) * 5,
                size: 8,
                damage: this.damage,
                type: 'diamond'
            });
        }
    }
} 