import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


interface HealthChartProps {
  data: any[];
}



export function HealthChart({
  data,
}: HealthChartProps) {


  const chartData = data
    .slice()
    .reverse()
    .map((item) => ({

      date: new Date(
        item.uploaded_at
      ).toLocaleDateString(
        "en",
        {
          month: "short",
          day: "numeric",
        }
      ),

      score: item.health_score,

    }));



  return (

    <div className="w-full h-[300px]">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={chartData}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />


          <XAxis
            dataKey="date"
          />


          <YAxis
            domain={[0,100]}
          />


          <Tooltip />



          <Line

            type="monotone"

            dataKey="score"

            strokeWidth={3}

            dot={{ r: 5 }}

          />


        </LineChart>


      </ResponsiveContainer>


    </div>

  );

}