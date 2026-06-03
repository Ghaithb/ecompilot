export interface TunisiaGovernorate {
  name: string;
  delegations: string[];
}

export const TUNISIA_GOVERNORATES: TunisiaGovernorate[] = [
  { name: 'Tunis', delegations: ['Tunis', 'Bab Bhar', 'Bab Souika', 'Carthage', 'La Marsa', 'Le Bardo', 'La Goulette', 'Sidi Bou Said'] },
  { name: 'Ariana', delegations: ['Ariana Ville', 'Raoued', 'La Soukra', 'Ettadhamen', 'Mnihla', 'Sidi Thabet'] },
  { name: 'Ben Arous', delegations: ['Ben Arous', 'Ezzahra', 'Radès', 'Mégrine', 'Mohamedia', 'Hammam Lif', 'Fouchana'] },
  { name: 'Manouba', delegations: ['Manouba', 'Den Den', 'Douar Hicher', 'Mornaguia', 'Tebourba', 'Jedeida'] },
  { name: 'Nabeul', delegations: ['Nabeul', 'Hammamet', 'Korba', 'Kelibia', 'Grombalia', 'Beni Khalled', 'Soliman'] },
  { name: 'Zaghouan', delegations: ['Zaghouan', 'Zriba', 'Saouaf', 'Nadhour', 'Bir Mcherga', 'El Fahs'] },
  { name: 'Bizerte', delegations: ['Bizerte Nord', 'Bizerte Sud', 'Mateur', 'Sejnane', 'Menzel Bourguiba', 'Ras Jebel', 'Utique'] },
  { name: 'Béja', delegations: ['Béja Nord', 'Béja Sud', 'Testour', 'Nefza', 'Amdoun', 'Goubellat', 'Medjez el Bab'] },
  { name: 'Jendouba', delegations: ['Jendouba', 'Tabarka', 'Aïn Draham', 'Fernana', 'Ghardimaou', 'Balta', 'Oued Meliz'] },
  { name: 'Le Kef', delegations: ['Le Kef', 'Dahmani', 'Tajerouine', 'Nebeur', 'Sakiet Sidi Youssef', 'Kalaat Senan', 'El Ksour'] },
  { name: 'Siliana', delegations: ['Siliana', 'Bargou', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Bou Arada'] },
  { name: 'Kairouan', delegations: ['Kairouan Nord', 'Kairouan Sud', 'Haffouz', 'Sbikha', 'Oueslatia', 'Hajeb El Ayoun', 'Nasrallah'] },
  { name: 'Kasserine', delegations: ['Kasserine Nord', 'Kasserine Sud', 'Fériana', 'Thala', 'Sbeitla', 'Foussana', 'Haïdra'] },
  { name: 'Sidi Bouzid', delegations: ['Sidi Bouzid', 'Meknassy', 'Regueb', 'Jilma', 'Bir El Hafey', 'Menzel Bouzaiane', 'Cebbala'] },
  { name: 'Sousse', delegations: ['Sousse Ville', 'Akouda', 'Hammam Sousse', 'Msaken', 'Enfidha', 'Hergla', 'Kalaa Kebira', 'Kondar'] },
  { name: 'Monastir', delegations: ['Monastir', 'Moknine', 'Bembla', 'Ksar Hellal', 'Jemmal', 'Teboulba', 'Bekalta', 'Sayada'] },
  { name: 'Mahdia', delegations: ['Mahdia', 'Chebba', 'Bou Merdes', 'Chorbane', 'El Jem', 'Hbira', 'Melloulech', 'Sidi Alouane'] },
  { name: 'Sfax', delegations: ['Sfax Ville', 'Sakiet Ezzit', 'Sakiet Eddaier', 'Thyna', 'Agareb', 'El Amra', 'Gremda', 'Mahares', 'Kerkennah'] },
  { name: 'Gabès', delegations: ['Gabès Ville', 'Gabès Sud', 'Gabès Ouest', 'Métouia', 'Ghannouch', 'Mareth', 'Matmata', 'Nouvelle Matmata'] },
  { name: 'Médenine', delegations: ['Médenine Nord', 'Médenine Sud', 'Ben Gardane', 'Zarzis', 'Djerba Midoun', 'Djerba Houmt Souk', 'Ajim', 'Beni Khedache'] },
  { name: 'Tataouine', delegations: ['Tataouine Nord', 'Tataouine Sud', 'Remada', 'Ghomrassen', 'Smar', 'Dehiba', 'Bir Lahmar'] },
  { name: 'Gafsa', delegations: ['Gafsa Nord', 'Gafsa Sud', 'El Ksar', 'Métlaoui', 'Moulares', 'Redeyef', 'Sened', 'Belkhir'] },
  { name: 'Tozeur', delegations: ['Tozeur', 'Degache', 'Hazoua', 'Nefta', 'Tameghza'] },
  { name: 'Kébili', delegations: ['Kébili Nord', 'Kébili Sud', 'Douz Nord', 'Douz Sud', 'Faouar', 'Souk Lahad'] },
];

export function getDelegationsForGovernorate(governorate: string): string[] {
  const found = TUNISIA_GOVERNORATES.find(
    (g) => g.name.toLowerCase() === governorate.toLowerCase(),
  );
  return found?.delegations ?? [];
}
