import Enemy from '../Enemy.js';

export default class ChestEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'chest',
            size: 30,
            speed: 1.5,
            health: 200,
            maxHealth: 200,
            color: '#DAA520',
            damage: 0,
            canCollide: false
        });
        
        // Propiedades para movimiento aleatorio
        this.directionChangeTimer = 0;
        this.maxDirectionChangeTime = 120; // Cambiar dirección cada 2 segundos
        this.currentAngle = Math.random() * Math.PI * 2; // Ángulo inicial aleatorio
    }

    // Sobrescribir el método de movimiento para que sea aleatorio
    moveTowardsPlayer(player) {
        // Reducir timer de cambio de dirección
        this.directionChangeTimer++;
        
        // Cambiar dirección aleatoriamente cada cierto tiempo
        if (this.directionChangeTimer >= this.maxDirectionChangeTime) {
            this.currentAngle = Math.random() * Math.PI * 2;
            this.directionChangeTimer = 0;
        }
        
        // Calcular nueva posición según el ángulo actual
        const dx = Math.cos(this.currentAngle) * this.speed;
        const dy = Math.sin(this.currentAngle) * this.speed;
        
        // Actualizar posición
        this.x += dx;
        this.y += dy;
        
        // Mantener dentro de los límites del canvas
        const canvas = window.game ? window.game.canvas : null;
        if (canvas) {
            // Rebotar en los bordes
            if (this.x < this.size/2) {
                this.x = this.size/2;
                this.currentAngle = Math.PI - this.currentAngle;
            } else if (this.x > canvas.width - this.size/2) {
                this.x = canvas.width - this.size/2;
                this.currentAngle = Math.PI - this.currentAngle;
            }
            
            if (this.y < this.size/2) {
                this.y = this.size/2;
                this.currentAngle = -this.currentAngle;
            } else if (this.y > canvas.height - this.size/2) {
                this.y = canvas.height - this.size/2;
                this.currentAngle = -this.currentAngle;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Base del cofre
        const gradient = ctx.createLinearGradient(
            this.x, this.y - this.size,
            this.x, this.y + this.size
        );
        gradient.addColorStop(0, '#8B4513');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/3, this.size, this.size/1.5);
        
        // Tapa del cofre
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y - this.size/3);
        ctx.lineTo(this.x + this.size/2, this.y - this.size/3);
        ctx.lineTo(this.x + this.size/2, this.y - this.size/1.2);
        ctx.lineTo(this.x - this.size/2, this.y - this.size/1.2);
        ctx.closePath();
        ctx.fill();
        
        // Detalles dorados
        ctx.fillStyle = '#FFD700';
        // Bisagras
        ctx.fillRect(this.x - this.size/2.2, this.y - this.size/3, this.size/10, this.size/5);
        ctx.fillRect(this.x + this.size/2.2 - this.size/10, this.y - this.size/3, this.size/10, this.size/5);
        
        // Cerradura
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size/4, this.size/6, 0, Math.PI * 2);
        ctx.fill();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    // Cuando muere, devolver 'chest' para generar el coleccionable
    takeDamage(amount) {
        this.health -= amount;
        this.isBlinking = true;
        this.blinkTimer = 5;
        return this.health <= 0 ? 'chest' : false;
    }
} 