import Player from '../Player.js';

export default class Francotirador extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Francotirador";
        this.description = "Especialista en ataques a larga distancia con gran precisión.";
        
        // Modificar las estadísticas para el francotirador
        this.stats.range = 180; // Mayor alcance inicial
        this.stats.critChance = 10; // Mayor probabilidad de crítico
        this.stats.strength = 20; // Menos fuerza base
        this.stats.moveSpeed = 4; // Menos velocidad
        this.stats.attackSpeed = 0.8; // Ataca más lento
        
        // Actualizar valores calculados
        this.attackRange = this.stats.range;
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#2F4F4F'; // Verde oscuro
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
        ctx.strokeStyle = '#1A3333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Ojos (uno cerrado como apuntando)
        const eyeSize = this.size * 0.15;
        ctx.fillStyle = '#000';
        
        // Ojo izquierdo (cerrado/apuntando)
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/4 - eyeSize, this.y - this.size/6);
        ctx.lineTo(this.x - this.size/4 + eyeSize, this.y - this.size/6);
        ctx.stroke();
        
        // Ojo derecho (abierto)
        ctx.beginPath();
        ctx.arc(this.x + this.size/4, this.y - this.size/6, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillo en el ojo abierto
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + this.size/4 + eyeSize/2, this.y - this.size/6 - eyeSize/2, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();

        // Boca seria/concentrada
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/5, this.y + this.size/6);
        ctx.lineTo(this.x + this.size/5, this.y + this.size/6);
        ctx.stroke();

        // Rifle/mira en la mano
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        // Rifle (orientado según la dirección del último proyectil)
        const rifleLength = this.size * 1.2;
        let targetX = this.x + rifleLength;
        let targetY = this.y;
        
        // Si hay proyectiles, orientar según el último
        if (this.projectiles.length > 0) {
            const lastProj = this.projectiles[this.projectiles.length - 1];
            const dx = lastProj.dx;
            const dy = lastProj.dy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            targetX = this.x + (dx / dist) * rifleLength;
            targetY = this.y + (dy / dist) * rifleLength;
        }
        
        // Dibujar el rifle
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        
        // Mira telescópica (círculo en el extremo del rifle)
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        
        // Soporte del rifle
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.size/3);
        ctx.stroke();

        // Dibujar proyectiles como balas
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(47, 79, 79, 0.8)';
            ctx.shadowBlur = 15;

            // Gradiente para el proyectil
            const gradient = ctx.createRadialGradient(
                proj.x, proj.y, 0,
                proj.x, proj.y, proj.size
            );
            gradient.addColorStop(0, '#FFA500');
            gradient.addColorStop(0.6, '#FF8C00');
            gradient.addColorStop(1, '#FF4500');

            // Ángulo de la bala
            const angle = Math.atan2(proj.dy, proj.dx);
            
            // Dibujar estela (trayectoria)
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(proj.x - proj.dx * 4, proj.y - proj.dy * 4);
            ctx.lineTo(proj.x - proj.dx * 4 + proj.dy * 2, proj.y - proj.dy * 4 - proj.dx * 2);
            ctx.lineTo(proj.x + proj.dy * 2, proj.y - proj.dx * 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            // Dibujar bala (forma ovalada en la dirección del movimiento)
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(angle);
            
            // Bala principal
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, proj.size * 1.5, proj.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Punta de la bala
            ctx.fillStyle = '#B22222';
            ctx.beginPath();
            ctx.ellipse(proj.size * 1.2, 0, proj.size * 0.5, proj.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        ctx.restore();
    }
    
    // Sobrescribir para aplicar las bonificaciones especiales
    useSkillPoint(stat) {
        if (this.skillPoints <= 0) return false;
        
        // Caso especial para el alcance: aumenta 8 puntos en lugar de 4
        if (stat === 'range') {
            this.stats.range += 8 * this.evolutionMultipliers.range;
            this.attackRange = this.stats.range;
            this.skillPoints--;
            return true;
        }
        
        // Para otras estadísticas, usar el comportamiento por defecto
        return super.useSkillPoint(stat);
    }
    
    // Sobrescribir para evitar la evolución de cabeza y manos
    evolve(part) {
        if (part === 'head' || part === 'hands') {
            return false; // No se puede evolucionar cabeza ni manos
        }
        
        return super.evolve(part);
    }
} 