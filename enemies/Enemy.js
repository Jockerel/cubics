export default class Enemy {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.type = config.type || 'default';
        this.size = config.size || 30;
        this.speed = config.speed || 2;
        this.health = config.health || 50;
        this.maxHealth = this.health;
        this.color = config.color || '#808080';
        this.projectiles = [];
        this.legOffset = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.damage = config.damage || 20;
        this.optimalRange = config.optimalRange || 0;
        this.shootProbability = config.shootProbability || 0;
        this.attackCooldown = 0;
        
        // Sistema de enfriamiento de colisión
        this.collisionCooldown = 0;
        this.maxCollisionCooldown = 60; // 1 segundo (60 frames)
    }

    draw(ctx) {
        // Método a sobrescribir por las subclases
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }

    drawHealthBar(ctx) {
        const healthPercentage = this.health / this.maxHealth;
        const barWidth = this.size * 1.2;
        const barHeight = 6;
        
        // Fondo de la barra de salud
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/1.2 - 10, barWidth, barHeight);
        
        // Barra de salud
        ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : (healthPercentage > 0.25 ? '#FFC107' : '#F44336');
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/1.2 - 10, barWidth * healthPercentage, barHeight);
    }

    moveTowardsPlayer(player) {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
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
        // Método básico de disparo
        if (Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: (dx / distance) * 5,
                dy: (dy / distance) * 5,
                size: 8,
                damage: this.damage
            });
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.isBlinking = true;
        this.blinkTimer = 5;
        return this.health <= 0;
    }

    update(player) {
        // Actualizar parpadeo
        if (this.isBlinking) {
            this.blinkTimer--;
            if (this.blinkTimer <= 0) {
                this.isBlinking = false;
            }
        }
        
        // Mover hacia el jugador
        this.moveTowardsPlayer(player);
        
        // Disparar si es apropiado
        if (this.shootProbability > 0) {
            this.shoot(player);
        }
        
        // Actualizar proyectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.dx;
            proj.y += proj.dy;
        });

        // Eliminar proyectiles fuera de la pantalla
        this.projectiles = this.projectiles.filter(proj => {
            if (typeof window !== 'undefined' && window.game && window.game.canvas) {
                return proj.x > 0 && proj.x < window.game.canvas.width && 
                       proj.y > 0 && proj.y < window.game.canvas.height;
            }
            return true;
        });
    }
} 