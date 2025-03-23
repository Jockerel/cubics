import Enemy from '../Enemy.js';

export default class StarEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, {
            type: 'star',
            size: 50,
            speed: 1,
            health: 1000,
            color: '#FFD700',
            damage: 34,
            optimalRange: 300,
            shootProbability: 0.02
        });
    }

    draw(ctx) {
        ctx.save();
        
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        
        // Cuerpo de estrella
        const outerRadius = this.size / 2;
        const innerRadius = outerRadius * 0.4;
        const spikes = 5;
        
        ctx.fillStyle = this.isBlinking ? '#ffffff' : this.color;
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            
            if (i === 0) {
                ctx.moveTo(this.x + radius * Math.cos(angle), this.y + radius * Math.sin(angle));
            } else {
                ctx.lineTo(this.x + radius * Math.cos(angle), this.y + radius * Math.sin(angle));
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Brillo exterior
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Ojos (brillantes)
        const eyeSize = this.size * 0.08;
        ctx.fillStyle = '#800000';
        ctx.beginPath();
        ctx.arc(this.x - this.size/6, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/6, this.y - this.size/10, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo en los ojos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - this.size/6 + eyeSize/3, this.y - this.size/10 - eyeSize/3, eyeSize/4, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/6 + eyeSize/3, this.y - this.size/10 - eyeSize/3, eyeSize/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca malvada
        ctx.strokeStyle = '#800000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/5, this.y + this.size/8);
        ctx.lineTo(this.x - this.size/10, this.y + this.size/5);
        ctx.lineTo(this.x, this.y + this.size/8);
        ctx.lineTo(this.x + this.size/10, this.y + this.size/5);
        ctx.lineTo(this.x + this.size/5, this.y + this.size/8);
        ctx.stroke();
        
        this.drawHealthBar(ctx);
        ctx.restore();
    }
    
    shoot(player) {
        if (Math.random() < this.shootProbability) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Patrón de disparo triple
            for (let i = -1; i <= 1; i++) {
                const angle = Math.atan2(dy, dx) + (i * Math.PI / 12);
                const projectileDx = Math.cos(angle) * 6;
                const projectileDy = Math.sin(angle) * 6;
                
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    dx: projectileDx,
                    dy: projectileDy,
                    size: 10,
                    damage: this.damage,
                    type: 'star'
                });
            }
        }
    }
} 