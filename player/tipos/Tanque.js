import Player from '../Player.js';

export default class Tanque extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Tanque";
        this.description = "Alta vida y defensa, pero movimiento lento y menos daño.";
        
        // Modificar las estadísticas para el tanque
        this.stats.health = 150;
        this.stats.maxHealth = 150;
        this.stats.armor = 15;
        this.stats.strength = 20;
        this.stats.moveSpeed = 3.5;
        this.stats.healthRegen = 0.05;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#4682B4';
    }
    
    // Sobrescribir el método draw para personalizar la apariencia
    draw(ctx) {
        // Sombra
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Cuerpo del cubo con color personalizado
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        // Resetear sombra
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Borde del cubo
        ctx.strokeStyle = '#2c5d8f';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos
        const eyeSize = this.size * 0.12; // Ojos más pequeños
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

        // Boca seria
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4, this.y + this.size/6);
        ctx.lineTo(this.x + this.size/4, this.y + this.size/6);
        ctx.stroke();

        // Brazos más gruesos
        ctx.strokeStyle = '#2c5d8f';
        ctx.lineWidth = 4;
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

        // Armadura en el pecho
        ctx.fillStyle = '#2c5d8f';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4, this.y - this.size/6 + 5);
        ctx.lineTo(this.x + this.size/4, this.y - this.size/6 + 5);
        ctx.lineTo(this.x + this.size/6, this.y + this.size/4);
        ctx.lineTo(this.x - this.size/6, this.y + this.size/4);
        ctx.closePath();
        ctx.fill();

        // Dibujar proyectiles
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(70, 130, 180, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#6495ED');
            gradient.addColorStop(0.6, '#4682B4');
            gradient.addColorStop(1, '#2c5d8f');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(70, 130, 180, 0.3)';
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
    
    // Sobrescribir el método takeDamage para reducir aún más el daño
    takeDamage(damage) {
        // Cálculo de reducción de daño mejorado para el Tanque
        const damageReduction = (this.stats.armor * 1.2) / (this.stats.armor * 1.2 + 100);
        const actualDamage = damage * (1 - damageReduction);
        
        // Calcular probabilidad de esquivar
        if (Math.random() * 100 < this.stats.agility) {
            return { damage: 0, type: 'miss' }; // Daño esquivado
        }
        
        // Aplicar el daño a la vida actual
        this.stats.health = Math.max(0, this.stats.health - actualDamage);
        return { damage: actualDamage, type: 'received' };
    }
} 