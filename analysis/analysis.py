import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Read the CSV files
mystudylife_data = pd.read_csv("MyStudyLife.csv")
leerplan_data = pd.read_csv("LeerPlan.csv")

# Define the factors
factors = ["Perceived Usefulness", "Perceived Ease of Use", 
           "Ease of Data Collection", "Behavioral Intentions", 
           "Active Use", "Satisfaction"]

# Calculate averages for each factor
def calculate_averages(data):
    return pd.DataFrame({
        'Factor': factors,
        'Average': [data[factor].mean() for factor in factors]
    })

mystudylife_avg = calculate_averages(mystudylife_data)
leerplan_avg = calculate_averages(leerplan_data)

# Add Application column
mystudylife_avg['Application'] = 'MyStudyLife'
leerplan_avg['Application'] = 'LeerPlan'

# Combine the averages
combined_avg = pd.concat([mystudylife_avg, leerplan_avg])

# Create a pivot table for easier comparison
avg_table = combined_avg.pivot(index='Factor', columns='Application', values='Average')
avg_table = avg_table.round(2)  # Round to 2 decimal places

# Calculate the difference between MyStudyLife and LeerPlan
avg_table['Difference'] = avg_table['MyStudyLife'] - avg_table['LeerPlan']
avg_table['Difference'] = avg_table['Difference'].round(2)  # Round the difference to 2 decimal places

# Save the table to a CSV file
avg_table.to_csv('average_values_table.csv')

# Print the table
print(avg_table)

# Set up the plot
plt.figure(figsize=(12, 8))
sns.set_style("whitegrid")

# Create the bar plot
ax = sns.barplot(x='Factor', y='Average', hue='Application', data=combined_avg,
                 palette={'MyStudyLife': '#0EA5E9', 'LeerPlan': '#CA8A04'})

# Customize the plot
plt.title('Comparison of MyStudyLife and LeerPlan', fontsize=16)
plt.xlabel('Factors', fontsize=12)
plt.ylabel('Average Score', fontsize=12)
plt.ylim(0, 7)  # Set y-axis limits from 0 to 7

# Rotate x-axis labels
plt.xticks(rotation=45, ha='right')

# Adjust layout to prevent cutting off labels
plt.tight_layout()

# Save the plot
plt.savefig('comparative_bar_chart.png', dpi=300)

# Display the plot (optional)
plt.show()