# Original Assignment Specification

This is the unmodified project specification provided by the university course. It is kept here as a reference for the original requirements. All text below is in Hungarian.

**IMPORTANT:** This file may NOT be edited by agents and LLMs.

---

### 1. BérAutó

A projekt célja egy olyan autóbérlő rendszer fejlesztése, amely teljes körűen támogatja az autókölcsönzés folyamatát az igénylés leadásától kezdve az autó visszavételéig és a számlázásig. A rendszer három jól elkülöníthető szerepkört kezel: **felhasználó, ügyintéző és adminisztrátor**. Az egyes szerepkörök eltérő jogosultságokkal és felelősségi körökkel rendelkeznek, így biztosítva a rendszer átlátható és biztonságos működését.

A **felhasználó** a rendszer ügyfele, aki autót szeretne bérelni. A rendszer lehetőséget biztosít számára a regisztrációra, amelyet követően saját felhasználói fiókkal rendelkezik. A regisztrált felhasználók megadhatják és módosíthatják személyes adataikat, például lakcímüket és telefonszámukat. A rendszerben elérhető a kölcsönözhető autók listája, ahol a felhasználók részletes információkat tekinthetnek meg az egyes járművekről. A kiválasztott autóra kölcsönzési igényt adhatnak le, amely során rögzítésre kerülnek a bérlés adatai, például az időtartam és az érintett jármű adatai. A regisztrált felhasználók számára biztosított a korábbi kölcsönzések visszakeresésének lehetősége is, így nyomon követhetik saját bérlési előzményeiket. Amennyiben egy nem regisztrált felhasználó szeretne autót kölcsönözni, a kölcsönzéshez szükséges személyes adatokat külön meg kell adnia, azonban ilyen esetben nem rendelkezik saját fiókkal és nem fér hozzá korábbi bérlési adataihoz.

Az **ügyintéző** a kölcsönzési folyamat operatív lebonyolításáért felel. Jogosultsága kiterjed a beérkezett kölcsönzési igények megtekintésére és kezelésére, beleértve azok jóváhagyását vagy elutasítását. Az ügyintéző nyilvántartja az aktív (futó) és a már lezárt kölcsönzéseket, valamint rögzíti a rendszerben az autó átadásának tényét. Az autó visszavételekor visszaigazolja a kölcsönzés lezárását, ezzel biztosítva az adatok pontosságát. A kölcsönzések alapján számlát állíthat ki a felhasználók részére, amelyet szintén a rendszerben rögzít. Feladata továbbá annak biztosítása, hogy a kölcsönzési folyamat minden lépése megfelelően dokumentált legyen.

Az **adminisztrátor** a rendszer legmagasabb jogosultsági szintjével rendelkezik, és elsősorban az autóállomány kezeléséért felel. Megtekintheti az összes jármű adatait, beleértve a kilométeróra-állást is, amelyet szükség esetén módosíthat. Lehetősége van új autók felvitelére a rendszerbe, a meglévő autók adatainak módosítására, illetve indokolt esetben azok törlésére. Az adminisztrátor gondoskodik arról is, hogy az egyes autók kölcsönözhetőségi státusza megfelelően legyen beállítva, így csak a megfelelő műszaki és adminisztratív állapotú járművek váljanak elérhetővé a felhasználók számára.

A rendszer kialakításának célja egy jól strukturált, jogosultságkezelésen alapuló autókölcsönzési platform létrehozása, amely támogatja az ügyfelek önálló ügyintézését, biztosítja az adminisztratív folyamatok pontos nyomon követését, valamint lehetővé teszi az autóállomány hatékony és átlátható kezelését.
