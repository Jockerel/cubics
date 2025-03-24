import Player from '../Player.js';

export default class Mago extends Player {
    constructor(x, y) {
        super(x, y);
        
        // Sobrescribir nombre y descripción
        this.name = "Mago";
        this.description = "Gran alcance y daño por proyectil, pero baja defensa y vida.";
        
        // Modificar las estadísticas para el mago
        this.stats.health = 70;
        this.stats.maxHealth = 70;
        this.stats.armor = 2;
        this.stats.strength = 30;
        this.stats.agility = 8;
        this.stats.attackSpeed = 0.8;
        this.stats.critChance = 15;
        this.stats.critDamage = 180;
        this.stats.range = 200;
        this.stats.moveSpeed = 4.5;
        
        // Actualizar valores calculados
        this.attackRange = this.stats.range;
        this.maxAttackCooldown = 60 / this.stats.attackSpeed;
        
        // Color personalizado
        this.color = '#FF7F50';
        
        // Para ataques múltiples
        this.multiTargetChance = 0.4; // 40% de probabilidad de atacar a múltiples objetivos
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
        ctx.strokeStyle = '#E25822';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);

        // Sombrero de mago
        ctx.fillStyle = '#4B0082';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y - this.size/2);
        ctx.lineTo(this.x, this.y - this.size - 10);
        ctx.closePath();
        ctx.fill();
        
        // Borde del sombrero
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/1.5, this.y - this.size/2 + 3);
        ctx.lineTo(this.x + this.size/1.5, this.y - this.size/2 + 3);
        ctx.stroke();
        
        // Estrella en el sombrero
        ctx.fillStyle = '#FFD700';
        const starSize = 5;
        ctx.beginPath();
        const starPoints = 5;
        const starOuterRadius = starSize;
        const starInnerRadius = starSize / 2;
        
        const cx = this.x;
        const cy = this.y - this.size/2 - 15;
        
        for (let i = 0; i < starPoints * 2; i++) {
            const radius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
            const angle = (Math.PI * i) / starPoints;
            const x = cx + radius * Math.sin(angle);
            const y = cy + radius * Math.cos(angle);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();

        // Ojos (con un aspecto más sabio)
        const eyeSize = this.size * 0.15;
        ctx.fillStyle = '#000';
        // Ojo izquierdo
        ctx.beginPath();
        ctx.arc(this.x - this.size/4, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Ojo derecho
        ctx.beginPath();
        ctx.arc(this.x + this.size/4, this.y - this.size/8, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Brillos en los ojos
        ctx.fillStyle = '#4B0082';
        ctx.beginPath();
        ctx.arc(this.x - this.size/4 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.size/4 + eyeSize/2, this.y - this.size/8 - eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa misteriosa
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size/8, this.size/6, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Barba
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/6, this.y + this.size/8);
        ctx.lineTo(this.x + this.size/6, this.y + this.size/8);
        ctx.lineTo(this.x, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();

        // Brazos (con un bastón mágico)
        ctx.strokeStyle = '#E25822';
        ctx.lineWidth = 2;
        // Brazo izquierdo
        ctx.beginPath();
        ctx.moveTo(this.x - this.size/2, this.y);
        ctx.lineTo(this.x - this.size/2 - 10, this.y + 5);
        ctx.stroke();
        
        // Bastón mágico
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + this.size/2, this.y - this.size/4);
        ctx.lineTo(this.x + this.size/2 + 20, this.y - this.size/2 - 10);
        ctx.stroke();
        
        // Gema en el bastón
        ctx.fillStyle = '#4B0082';
        ctx.beginPath();
        ctx.arc(this.x + this.size/2 + 20, this.y - this.size/2 - 10, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura mágica alrededor del personaje (sutilmente)
        ctx.fillStyle = 'rgba(200, 100, 200, 0.1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Dibujar proyectiles mágicos
        ctx.save();
        this.projectiles.forEach(proj => {
            // Sombra del proyectil
            ctx.shadowColor = 'rgba(255, 127, 80, 0.8)';
            ctx.shadowBlur = 15;

            // Efecto de rotación
            const time = Date.now() / 100;
            ctx.translate(proj.x, proj.y);
            ctx.rotate(time % (Math.PI * 2));
            
            // Dibujar proyectil como una estrella
            ctx.fillStyle = '#FF7F50';
            ctx.beginPath();
            
            const projPoints = 5;
            const projOuterRadius = proj.size;
            const projInnerRadius = proj.size / 2;
            
            for (let i = 0; i < projPoints * 2; i++) {
                const radius = i % 2 === 0 ? projOuterRadius : projInnerRadius;
                const angle = (Math.PI * i) / projPoints;
                const x = radius * Math.sin(angle);
                const y = radius * Math.cos(angle);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            
            ctx.closePath();
            ctx.fill();
            
            // Aura alrededor del proyectil
            ctx.fillStyle = 'rgba(255, 127, 80, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, proj.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Partículas mágicas (pequeños puntos)
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = proj.size * 2 * Math.random();
                const particleX = distance * Math.cos(angle);
                const particleY = distance * Math.sin(angle);
                
                ctx.fillStyle = `rgba(255, 215, 0, ${0.7 * Math.random() + 0.3})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.rotate(-(time % (Math.PI * 2)));
            ctx.translate(-proj.x, -proj.y);
        });
        ctx.restore();
    }
    
    // Sobrescribir el método attack para permitir ataques múltiples
    attack(enemies) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
            return;
        }

        // Verificar si hay suficientes enemigos para atacar
        if (enemies.length === 0) return;
        
        // Determinar si este ataque será múltiple
        const isMultiTarget = Math.random() < this.multiTargetChance;
        
        if (isMultiTarget && enemies.length > 1) {
            // Atacar a múltiples objetivos
            const targetCount = Math.min(3, enemies.length); // Máximo 3 objetivos
            const targets = [];
            
            // Seleccionar enemigos aleatorios
            const availableEnemies = [...enemies];
            for (let i = 0; i < targetCount; i++) {
                const randomIndex = Math.floor(Math.random() * availableEnemies.length);
                targets.push(availableEnemies[randomIndex]);
                availableEnemies.splice(randomIndex, 1);
                
                if (availableEnemies.length === 0) break;
            }
            
            // Lanzar proyectiles a cada objetivo
            targets.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.attackRange) {
                    const isCritical = Math.random() * 100 < this.stats.critChance;
                    const damage = this.stats.strength * (isCritical ? this.stats.critDamage / 100 : 1) * 0.8; // Reducción por ser multi-objetivo
                    
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
                }
            });
        } else {
            // Ataque normal a un solo objetivo (el más cercano)
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
                
                const isCritical = Math.random() * 100 < this.stats.critChance;
                const damage = this.stats.strength * (isCritical ? this.stats.critDamage / 100 : 1) * 1.2; // Bonus por ser objetivo único
                
                // Crear proyectil
                this.projectiles.push({
                    x: this.x,
                    y: this.y,
                    dx: (dx / distance) * 5,
                    dy: (dy / distance) * 5,
                    size: 14, // Más grande que el normal
                    damage: damage,
                    isCritical: isCritical
                });
            }
        }
        
        this.attackCooldown = this.maxAttackCooldown;
    }
} 