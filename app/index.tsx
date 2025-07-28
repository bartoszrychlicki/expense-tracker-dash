import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      className="flex-1 justify-center items-center bg-background-0"
    >
      <Text className="mb-4">Edit app/index.tsx to edit this screen.</Text>
      <Card size="lg" variant="elevated" className="shadow-lg">
        <Heading size="2xl" className="text-primary-900 mb-2">312 PLN</Heading>
        <Text size="sm" className="text-typography-600">Zostało dzisiaj do wydania</Text>
      </Card>
    </View>
  );
}
