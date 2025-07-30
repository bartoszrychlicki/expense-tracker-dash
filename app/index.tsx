import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

// TODO: replace with your Airtable Base ID
const AIRTABLE_BASE_ID = "appFKp3PqUbg7tcxe";
const AIRTABLE_TABLE_NAME = "days";
const AIRTABLE_TRANSACTIONS_TABLE = "transactions";
// Authorization token provided by Airtable
const AIRTABLE_API_KEY = "pateg4IGkbM6zAoZU.312eb8dfc60d6f1274fd43d9acc80b5a9d94d11bb2bb598f4d63bc6819a82171";

interface Transaction {
  id: string;
  Name: string;
  Ai_Category: string;
  Value: string;
  Date: string;
}

export default function Index() {
  const [dailyBudgetLeft, setDailyBudgetLeft] = useState<string>();
  const [dailySpentSum, setDailySpentSum] = useState<string>();
  const [todaysVariableDailyLimit, setTodaysVariableDailyLimit] = useState<string>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchLatestDayRecord() {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?sort[0][field]=Created at&sort[0][direction]=desc&maxRecords=1`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });
      const data = await response.json();
      if (data.records?.length) {
        const fields = data.records[0].fields;
        setDailyBudgetLeft(fields["Daily budget left"]?.toString());
        setDailySpentSum(fields["Daily spent sum"]?.toString());
        setTodaysVariableDailyLimit(fields["Todays variable daily limit"]?.toString());
      }
    }

    async function fetchTransactions() {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TRANSACTIONS_TABLE}?sort[0][field]=transaction date&sort[0][direction]=desc&maxRecords=10`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      });
      const data = await response.json();
      if (data.records?.length) {
        const transactionsData = data.records.map((record: any) => ({
          id: record.id,
          Name: record.fields.Name || "",
          Ai_Category: record.fields.Ai_Category || "",
          Value: record.fields.Value?.toString() || "",
          Date: record.fields["transaction date"] || "",
        }));
        setTransactions(transactionsData);
      }
    }

    fetchLatestDayRecord();
    fetchTransactions();
  }, []);

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
        <Heading size="md" className="mb-3">
            Budget na dziś
          </Heading>
          <Card size="lg" variant="outline" className="mb-4">
            <Heading size="lg" className="mb-1">
              {dailyBudgetLeft ?? "--"} PLN
            </Heading>
            <Text size="sm" className="text-typography-600">
              Zostało na dzisiaj
            </Text>
          </Card>
          <HStack space="md" className="mb-4">
            <Card size="lg" variant="outline" className="flex-1">
              <Heading size="lg" className="mb-1">
                {todaysVariableDailyLimit ?? "--"} PLN
              </Heading>
              <Text size="sm" className="text-typography-600">
                Całkowity budzet na dziś
              </Text>
            </Card>
            <Card size="lg" variant="outline" className="flex-1">
              <Heading size="lg" className="mb-1">
                {dailySpentSum ?? "--"} PLN
              </Heading>
              <Text size="sm" className="text-typography-600">
                Wydałem dzisiaj
              </Text>
            </Card>
          </HStack>

          
          <VStack
            className="border border-border-300 rounded-lg px-4 py-6 items-center justify-between"
            space="sm"
          >
            <Box className="self-start w-full px-4">
              <Heading
                size="lg"
                className="font-roboto text-typography-700"
              >
                10 ostatnich transakcji
              </Heading>
            </Box>
            <Divider />
            {transactions.map((transaction, index) => {
              const isPositive = parseFloat(transaction.Value) > 0;
              return (
                <HStack space="lg" key={transaction.id} className="w-full px-4 py-2 items-center">
                  <Box 
                    className={`rounded-full h-12 w-12 items-center justify-center ${
                      isPositive ? 'bg-error-100' : 'bg-success-100'
                    }`}
                  >
                    <Text 
                      className={`text-sm font-medium ${
                        isPositive ? 'text-error-800' : 'text-success-800'
                      }`}
                    >
                      {transaction.Value}
                    </Text>
                  </Box>
                  <VStack className="flex-1">
                    <Text className="text-xs text-typography-500 mb-1">
                      {transaction.Date}
                    </Text>
                    <Text className="text-typography-900 font-roboto line-clamp-1">
                      {transaction.Name}
                    </Text>
                    <Text className="text-sm font-roboto line-clamp-1">
                      {transaction.Ai_Category}
                    </Text>
                  </VStack>
                </HStack>
              );
            })}
          </VStack>
        </View>
      </ScrollView>
    </View>
  );
}
