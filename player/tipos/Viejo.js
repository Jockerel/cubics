import Player from '../Player.js';

export default class Viejo extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Viejo";
        this.description = "Sabio anciano con gran resistencia, pero lenta movilidad y limitaciones físicas.";
        
        // Modificar las estadísticas para el viejo
        this.stats.moveSpeed = 2.5;
        this.stats.health = 120;
        this.stats.maxHealth = 120;
        this.stats.healthRegen = 0.04;
        this.stats.strength = 22;
        
        // Actualizar valores calculados
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#808080'; // Gris
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
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos con gafas
        const eyeSize = this.size * 0.12;
        
        // Marco de gafas
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.x - this.size/4, this.y - this.size/6, eyeSize * 1.5, eyeSize * 1.2, 0, 0, Math.PI * 2);
        ctx.ellipse(this.x + this.size/4, this.y - this.size/6, eyeSize * 1.5, eyeSize * 1.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Puente de las gafas
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4 + eyeSize, this.y - this.size/6);
        ctx.lineTo(this.x + this.size/4 - eyeSize, this.y - this.size/6);
        ctx.stroke();
        
        // Patillas de las gafas
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4 - eyeSize * 1.5, this.y - this.size/6);
        ctx.lineTo(this.x - this.size/2 - 5, this.y - this.size/6);
        ctx.moveTo(this.x + this.size/4 + eyeSize * 1.5, this.y - this.size/6);
        ctx.lineTo(this.x + this.size/2 + 5, this.y - this.size/6);
        ctx.stroke();
        
        // Ojos detrás de las gafas
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

        // Barba
        ctx.fillStyle = '#DCDCDC';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size/4, this.size/3, this.size/4, 0, 0, Math.PI);
        ctx.fill();
        
        // Cejas pobladas
        ctx.strokeStyle = '#DCDCDC';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4 - eyeSize, this.y - this.size/6 - eyeSize);
        ctx.lineTo(this.x - this.size/4 + eyeSize, this.y - this.size/6 - eyeSize * 0.8);
        ctx.moveTo(this.x + this.size/4 - eyeSize, this.y - this.size/6 - eyeSize * 0.8);
        ctx.lineTo(this.x + this.size/4 + eyeSize, this.y - this.size/6 - eyeSize);
        ctx.stroke();

        // Bastón
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2 - 10, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2 - 5, this.y + this.size/2 + 15);
        ctx.stroke();
        
        // Mango del bastón
        ctx.beginPath();
        ctx.arc(this.x - this.size/2 - 10, this.y - this.size/2, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Dibujar proyectiles con efecto de sabiduría
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(128, 128, 128, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.6, '#DCDCDC');
            gradient.addColorStop(1, '#A9A9A9');

            // Dibujar aura exterior
            ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
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
            
            // Pequeños símbolos rúnicos
            ctx.strokeStyle = '#505050';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(proj.x - proj.size/2, proj.y);
            ctx.lineTo(proj.x + proj.size/2, proj.y);
            ctx.moveTo(proj.x, proj.y - proj.size/2);
            ctx.lineTo(proj.x, proj.y + proj.size/2);
            ctx.moveTo(proj.x - proj.size/3, proj.y - proj.size/3);
            ctx.lineTo(proj.x + proj.size/3, proj.y + proj.size/3);
            ctx.moveTo(proj.x + proj.size/3, proj.y - proj.size/3);
            ctx.lineTo(proj.x - proj.size/3, proj.y + proj.size/3);
            ctx.stroke();
        });
        ctx.restore();
    }
    
    // Sobrescribir para aplicar las bonificaciones especiales
    useSkillPoint(stat) {
        if (this.skillPoints <= 0) return false;
        
        // Caso especial para la vida: aumenta 12 puntos en lugar de 8
        if (stat === 'health') {
            this.stats.maxHealth += 12 * this.evolutionMultipliers.health;
            this.stats.health = this.stats.maxHealth;
            this.skillPoints--;
            return true;
        }
        
        // Para otras estadísticas, usar el comportamiento por defecto
        return super.useSkillPoint(stat);
    }
    
    // Sobrescribir para evitar la evolución de los pies
    evolve(part) {
        if (part === 'feet') {
            return false; // No se puede evolucionar los pies
        }
        
        return super.evolve(part);
    }
} 