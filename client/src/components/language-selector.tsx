import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";

export function LanguageSelector() {
  const { getCurrentLanguage, changeLanguage, getLanguageOptions } = useI18n();
  
  const currentLanguage = getCurrentLanguage();
  const options = getLanguageOptions();
  const currentOption = options.find(opt => opt.code === currentLanguage);

  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      <SelectTrigger className="w-20 border-none bg-transparent text-xs">
        <SelectValue>
          {currentOption ? `${currentOption.flag} ${currentOption.code.toUpperCase()}` : 'EN'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            <span className="flex items-center space-x-2">
              <span>{option.flag}</span>
              <span>{option.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
