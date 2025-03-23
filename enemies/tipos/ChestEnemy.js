import Enemy from '../Enemy.js';

export default class ChestEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'chest',
            size: 40,
            speed: 3,
            health: 200,
            color: '#8B4513',
            damage: 25
        });
    }

    draw(ctx) {
        ctx.save();
        
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

        // Ojos
        const eyeSize = this.size * 0.08;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - this.size/5, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/5, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Boca
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/10, this.size/10, 0, Math.PI);
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    // Cuando muere, no se cuenta como enemigo normal
    takeDamage(amount) {
        this.health -= amount;
        this.isBlinking = true;
        this.blinkTimer = 5;
        return this.health <= 0 ? 'chest' : false;
    }
} 