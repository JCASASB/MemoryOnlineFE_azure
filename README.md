Hola,

esta es una implementacion en react typescript de un juego memory de cartas online en tiempo real con tecnologia signalr microsoft.

Tiene una implementacion de login de usuarios para cada player. Llamar a un web api rest desde login para obtener un oauth token que autentica las llamadas del signalr.

Para testear, solo hay dos usuarios ahora 'a' y 'b' hardcodeados los passwords no importan.

Arquitectura hexagonal DDD. Inyeccion de dependencias.

La parte core donde reside el dominio y aplicacion la he separado en dos modulos, uno para el juego en si y otro para un chat.

Está diseñado para mantener logica del juego dentro de la app react. Esto es, no se centraliza en el back end o sea el BE no tiene el control del juego. El estado del juego se mantiene en el navegador, se modifica el estado y se envia al BE, que reenvia al adversario. (Experimento para ahorrar procesamiento en el BE...) como es obvio conlleva alguna deficiencia de seguridad. (Estado es visible a traves de las debug tools del browser ).
Algún tipo de encriptacion podria mitigarlo.

## Sincronizar el repositorio público

Después de confirmar los cambios en la rama `main`, ejecuta:

```powershell
.\scripts\sync-public-repo.ps1
```

El script actualiza `MemoryOnlineFE_azure/main` y copia sus commits a
`MemoryOnlineFE/main`. Se detiene si hay cambios locales sin commit. Si el
repositorio público ha divergido y quieres reemplazarlo deliberadamente:

```powershell
.\scripts\sync-public-repo.ps1 -ForceMirror
```

El juego mantiene los estados del board completos (json) en una base de datos en el navegador de tipo indexedDb gestionada con libreria Dexie. Un motor timer (un worker) va consultando por si hay algun estado nuevo a aplicar en la interfaz.

O:)

## ⚠️ Licencia y Derechos de Autor

Este proyecto es de **propiedad privada** exclusiva. El código está expuesto de forma
pública únicamente como parte de mi portafolio profesional. **No se otorga ninguna licencia**
para su uso, copia o modificación. Todos los derechos están reservados.

```

```
